import {execSync} from 'child_process';
import {existsSync, writeFileSync} from 'fs';
import path from 'path';
import {PREFIX} from './const.mjs';

const dirname = 'zimg';

export const enableZimg = (isWindows) => {
	const pkgConfig = `
prefix=${process.cwd()}/zimg/remotion
exec_prefix=$\{prefix\}
libdir=$\{exec_prefix\}/lib
includedir=$\{prefix\}/include

Name: zimg
Description: Scaling, colorspace conversion, and dithering library
Version: 2.9.3

# If building a static library against a C++ runtime other than libstdc++,
# define STL_LIBS when running configure.
Libs: -L$\{libdir\} -lzimg -lstdc++ -lm ${isWindows ? '' : '-ldl'}
Cflags: -I$\{includedir\}
  `.trim();

	if (!existsSync(dirname)) {
		execSync('git clone https://github.com/sekrit-twc/zimg zimg', {
			stdio: 'inherit',
		});
	}
	execSync('git stash', {
		cwd: dirname,
		stdio: 'inherit',
	});
	execSync('git submodule update --init --recursive', {
		cwd: dirname,
		stdio: 'inherit',
	});

	execSync('git checkout release-2.9.3', {
		cwd: dirname,
	});

	if (process.platform === 'darwin') {
		execSync(
			`sed -i '' 's/size_t/std::size_t/g' src/zimg/colorspace/matrix3.cpp`,
			{
				cwd: dirname,
				stdio: 'inherit',
			},
		);
	} else {
		execSync(
			`sed -i 's/size_t/std::size_t/g' src/zimg/colorspace/matrix3.cpp`,
			{
				cwd: dirname,
				stdio: 'inherit',
			},
		);
	}

	execSync('sh autogen.sh', {
		cwd: dirname,
	});

	execSync(
		`./configure --enable-static --with-pic --prefix=${path.join(
			process.cwd(),
			dirname,
			PREFIX,
		)} --disable-shared ${isWindows ? '--host=x86_64-w64-mingw32' : ''}`,
		{
			cwd: dirname,
			stdio: 'inherit',
		},
	);

	execSync('make', {
		cwd: dirname,
		stdio: 'inherit',
	});

	execSync('make install', {
		cwd: dirname,
		stdio: 'inherit',
	});

	execSync(`cp -r ${PREFIX} ../`, {cwd: dirname, stdio: 'inherit'});
	const outPath = path.join(process.cwd(), 'remotion/lib/pkgconfig/zimg.pc');

	if (!existsSync(path.dirname(outPath))) {
		mkdirSync(path.dirname(outPath), {
			recursive: true,
		});
	}
	writeFileSync(outPath, pkgConfig);
};
