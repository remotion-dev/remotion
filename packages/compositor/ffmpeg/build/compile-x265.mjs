import {execSync} from 'child_process';
import fs, {readFileSync} from 'fs';
import {MACOS_DEPLOYMENT_TARGET, PREFIX} from './const.mjs';

export const enableX265 = (isMusl, isWindows, isOldCmake) => {
	if (isWindows) {
		// The checked-in x265-windows artifacts come from:
		// https://github.com/videolan/x265/tree/419182243fb2e2dfbe91dfc45a51778cf704f849
		// (2020-12-15, tag 3.4 + 28 commits, X265_BUILD 198). They were built for
		// 64-bit Windows at 8-bit depth with MSYS2 GCC 12.2.0. The source revision
		// is corroborated by X265_BUILD in x265_config.h, the version string
		// "3.4+28-419182243" in libx265.a, and X265_BUILD in source/CMakeLists.txt.
		execSync('cp x265-windows/lib/libx265.a remotion/lib/libx265.a');
		execSync(
			'cp x265-windows/lib/pkgconfig/x265.pc remotion/lib/pkgconfig/x265.pc',
		);
		execSync(
			'cp x265-windows/include/x265_config.h remotion/include/x265_config.h ',
		);
		execSync('cp x265-windows/include/x265.h remotion/include/x265.h');
		return;
	}
	const extraCFlags = [
		// TODO: should it always be static libgcc?
		isMusl ? '-static-libgcc' : null,
	].filter(Boolean);

	if (!fs.existsSync('x265')) {
		if (isOldCmake) {
			execSync('git clone https://github.com/videolan/x265 x265', {
				stdio: 'inherit',
			});
		} else {
			execSync(
				'git clone https://bitbucket.org/multicoreware/x265_git.git x265',
				{
					stdio: 'inherit',
				},
			);
		}
	}

	execSync('git fetch', {
		cwd: 'x265',
		stdio: 'inherit',
	});

	if (isOldCmake) {
		// stable as marked on the github repo
		// for older cmake versions
		execSync('git checkout 02d2f496c94c0ef253766b826d95af3404b2781e', {
			cwd: 'x265',
			stdio: 'inherit',
		});
	} else {
		// for newer cmake versions
		execSync('git checkout 8f11c33acc267ba3f1d2bde60a6aa906e494cbde', {
			cwd: 'x265',
			stdio: 'inherit',
		});
	}

	const staticallyLinkCLibrary = isMusl || isWindows;

	const env = {
		...process.env,
		CMAKE_CROSSCOMPILING: isWindows ? 'ON' : undefined,
		CMAKE_C_COMPILER: isWindows ? 'x86_64-w64-mingw32-gcc' : undefined,
		CMAKE_CXX_COMPILER: isWindows ? 'x86_64-w64-mingw32-g++' : undefined,
		CMAKE_RC_COMPILER: isWindows ? 'x86_64-w64-mingw32-windres' : undefined,
		CMAKE_RANLIB: isWindows ? 'x86_64-w64-mingw32-ranlib' : undefined,
		CMAKE_SYSTEM_NAME: isWindows ? 'Windows' : undefined,
		MACOSX_DEPLOYMENT_TARGET:
			process.platform === 'darwin' ? MACOS_DEPLOYMENT_TARGET : undefined,
		CMAKE_ASM_YASM_COMPILER: isWindows ? 'yasm' : undefined,
		CMAKE_CXX_FLAGS: isWindows
			? '-static-libgcc -static-libstdc++ -static -O3 -s'
			: undefined,
		CMAKE_C_FLAGS: isWindows
			? '-static-libgcc -static-libstdc++ -static -O3 -s'
			: undefined,
		CMAKE_SHARED_LIBRARY_LINK_C_FLAGS: isWindows
			? '-static-libgcc -static-libstdc++ -static -O3 -s'
			: undefined,
		CMAKE_SHARED_LIBRARY_LINK_CXX_FLAGS: isWindows
			? '-static-libgcc -static-libstdc++ -static -O3 -s'
			: undefined,
		CMAKE_INSTALL_PREFIX: PREFIX,
		CFLAGS: [process.env.CFLAGS, ...extraCFlags].filter(Boolean).join(' '),
	};

	// Determine whether to use 'cmake' or 'cmake3'
	let cmakeCmd = 'cmake';
	try {
		execSync('cmake --version', {stdio: 'ignore'});
	} catch {
		try {
			execSync('cmake3 --version', {stdio: 'ignore'});
			cmakeCmd = 'cmake3';
		} catch {
			throw new Error('Neither cmake nor cmake3 is available in PATH.');
		}
	}

	execSync(
		[
			cmakeCmd,
			'-DCMAKE_INSTALL_PREFIX="remotion"',
			'-DENABLE_SHARED:BOOL=OFF',
			'-DCMAKE_BUILD_TYPE=Release',
			'-DSTATIC_LINK_CRT:BOOL=' + (staticallyLinkCLibrary ? 'ON' : 'OFF'),
			'-DENABLE_PIC=ON',
			'-DENABLE_CLI:BOOL=OFF',
			process.platform === 'darwin'
				? `-DCMAKE_OSX_DEPLOYMENT_TARGET=${MACOS_DEPLOYMENT_TARGET}`
				: null,
			'source',
		]
			.filter(Boolean)
			.join(' '),
		{
			cwd: 'x265',
			stdio: 'inherit',
			env,
		},
	);

	execSync('make', {
		cwd: 'x265',
		stdio: 'inherit',
		env,
	});
	execSync('make install', {
		cwd: 'x265',
		stdio: 'inherit',
	});

	const x265 = readFileSync('x265/remotion/lib/pkgconfig/x265.pc', 'utf8');
	console.log('pkgconfig/x265.pc is:', x265);
	const lines = x265.split('\n');
	const privLibs = lines.find((line) => line.startsWith('Libs.private'));
	if (!privLibs) {
		throw new Error('Could not find Libs.private in x265.pc');
	}
	const extraLibs = privLibs.replace('Libs.private: ', '');
	const linesPkg = lines
		.map((line) => {
			if (line.startsWith('prefix=')) {
				return 'prefix=remotion';
			}
			if (line.startsWith('exec_prefix=')) {
				return 'exec_prefix=remotion';
			}
			const shouldAddPthread =
				!isMusl && !isWindows && process.platform !== 'darwin';
			const shouldAddLibxx = isMusl;
			if (line.startsWith('Libs:')) {
				return [
					line,
					isWindows
						? extraLibs.replace('-lrt', '').replace('-ldl', '')
						: extraLibs,
					shouldAddPthread ? '-lpthread' : null,
					shouldAddLibxx ? '-lstdc++' : null,
				]
					.filter(Boolean)
					.join(' ');
			}
			if (line.startsWith('Libs.private')) {
				return null;
			}

			return line;
		})
		.filter((l) => l !== null)
		.join('\n');

	console.log('Replacing it with:', linesPkg);
	fs.writeFileSync('x265/remotion/lib/pkgconfig/x265.pc', linesPkg);

	execSync('cp -r ' + PREFIX + ' ../', {
		cwd: 'x265',
		stdio: 'inherit',
	});
};
