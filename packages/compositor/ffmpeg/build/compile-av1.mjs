import {execSync} from 'child_process';
import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {MACOS_DEPLOYMENT_TARGET, PREFIX} from './const.mjs';

const getCmakeCommand = () => {
	try {
		execSync('cmake --version', {stdio: 'ignore'});
		return 'cmake';
	} catch {
		try {
			execSync('cmake3 --version', {stdio: 'ignore'});
			return 'cmake3';
		} catch {
			throw new Error('Neither cmake nor cmake3 is available in PATH.');
		}
	}
};

const getToolPath = (tool) => {
	try {
		return execSync(`command -v ${tool}`, {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		throw new Error(`Required tool '${tool}' is not available in PATH.`);
	}
};

const enableDav1d = (isWindows) => {
	const pkgConfig = `
prefix=${process.cwd()}/av1/build
includedir=$\{prefix\}/include
libdir=$\{prefix\}/lib
srcdir=${process.cwd()}/av1

Name: libdav1d
Description: AV1 decoding library
Version: 1.2.1
Libs: -L$\{prefix\}/src -ldav1d -lpthread ${isWindows ? '' : '-ldl'}
Cflags: -I$\{prefix\}/src -I$\{srcdir\}/src -I$\{prefix\} -I$\{srcdir\} -I$\{prefix\}/include/dav1d -I$\{srcdir\}/include/dav1d -I$\{prefix\}/include -I$\{srcdir\}/include
  `.trim();

	if (!existsSync('av1')) {
		execSync('git clone https://code.videolan.org/videolan/dav1d av1', {
			stdio: 'inherit',
		});
	}

	execSync('git checkout 1.2.1', {
		cwd: 'av1',
	});

	rmSync('av1/build', {
		force: true,
		recursive: true,
	});

	mkdirSync('av1/build', {
		recursive: true,
	});

	execSync(
		'meson setup .. --default-library=static ' +
			(isWindows
				? '--cross-file=../package/crossfiles/x86_64-w64-mingw32.meson'
				: ''),
		{
			cwd: 'av1/build',
			stdio: 'inherit',
		},
	);

	execSync('ninja', {
		cwd: 'av1/build',
		stdio: 'inherit',
	});

	const outPath = join(process.cwd(), 'remotion/lib/pkgconfig/dav1d.pc');

	if (!existsSync(dirname(outPath))) {
		mkdirSync(dirname(outPath), {
			recursive: true,
		});
	}

	writeFileSync(outPath, pkgConfig);
};

const enableLibaom = (isWindows) => {
	const AOM_TAG = 'v3.9.1';
	const AOM_BUILD_DIR = 'aom-build';
	const shouldEnableNasm = !(
		process.platform === 'darwin' && process.arch === 'x64'
	);
	const windowsToolchain = isWindows
		? {
				cc: getToolPath('x86_64-w64-mingw32-gcc'),
				cxx: getToolPath('x86_64-w64-mingw32-g++'),
				rc: getToolPath('x86_64-w64-mingw32-windres'),
				ar: getToolPath('x86_64-w64-mingw32-ar'),
				ranlib: getToolPath('x86_64-w64-mingw32-ranlib'),
			}
		: null;
	if (!existsSync('aom')) {
		execSync('git clone https://aomedia.googlesource.com/aom aom', {
			stdio: 'inherit',
		});
	}

	execSync('git fetch --tags', {
		cwd: 'aom',
		stdio: 'inherit',
	});

	execSync(`git checkout ${AOM_TAG}`, {
		cwd: 'aom',
		stdio: 'inherit',
	});

	rmSync(AOM_BUILD_DIR, {
		force: true,
		recursive: true,
	});
	mkdirSync(AOM_BUILD_DIR, {
		recursive: true,
	});

	const cmakeCmd = getCmakeCommand();
	execSync(
		[
			cmakeCmd,
			join(process.cwd(), 'aom'),
			`-DCMAKE_INSTALL_PREFIX=${join(process.cwd(), 'aom', PREFIX)}`,
			'-DCMAKE_INSTALL_LIBDIR=lib',
			'-DCMAKE_BUILD_TYPE=MinSizeRel',
			'-DBUILD_SHARED_LIBS=OFF',
			'-DENABLE_TESTS=0',
			'-DENABLE_TESTDATA=0',
			'-DENABLE_DOCS=0',
			'-DENABLE_EXAMPLES=0',
			'-DENABLE_TOOLS=0',
			`-DENABLE_NASM=${shouldEnableNasm ? '1' : '0'}`,
			'-DCONFIG_PIC=1',
			'-DCMAKE_POSITION_INDEPENDENT_CODE=ON',
			'-DCONFIG_AV1_DECODER=0',
			'-DCONFIG_AV1_ENCODER=1',
			'-DCONFIG_AV1_HIGHBITDEPTH=0',
			process.platform === 'darwin'
				? `-DCMAKE_OSX_DEPLOYMENT_TARGET=${MACOS_DEPLOYMENT_TARGET}`
				: null,
			isWindows ? '-DCMAKE_SYSTEM_NAME=Windows' : null,
			isWindows ? `-DCMAKE_C_COMPILER=${windowsToolchain.cc}` : null,
			isWindows ? `-DCMAKE_CXX_COMPILER=${windowsToolchain.cxx}` : null,
			isWindows ? `-DCMAKE_RC_COMPILER=${windowsToolchain.rc}` : null,
			isWindows ? `-DCMAKE_AR=${windowsToolchain.ar}` : null,
			isWindows ? `-DCMAKE_RANLIB=${windowsToolchain.ranlib}` : null,
		]
			.filter(Boolean)
			.join(' '),
		{
			cwd: AOM_BUILD_DIR,
			stdio: 'inherit',
		},
	);

	execSync('make', {
		cwd: AOM_BUILD_DIR,
		stdio: 'inherit',
	});

	execSync('make install', {
		cwd: AOM_BUILD_DIR,
		stdio: 'inherit',
	});

	execSync('cp -r ' + PREFIX + ' ../', {
		cwd: 'aom',
		stdio: 'inherit',
	});
};

export const enableAv1 = ({isWindows, enableEncoder}) => {
	enableDav1d(isWindows);
	if (enableEncoder) {
		enableLibaom(isWindows);
	}
};
