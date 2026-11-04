import {execSync} from 'child_process';
import fs, {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {PREFIX} from './const.mjs';

const dirname = 'libvpx-1.12.0';

export const enableVpx = (isWindows) => {
	if (isWindows) {
		execSync('mkdir -p vpx-windows', {stdio: 'inherit'});
		execSync('tar vfx vpx-windows.tar.gz -C vpx-windows');
		execSync(`mkdir -p ./${PREFIX}/lib/pkgconfig`);
		execSync(`mkdir -p ./${PREFIX}/include`);
		execSync(`cp -r vpx-windows/include ./${PREFIX}`, {
			stdio: 'inherit',
		});
		execSync(`cp -r vpx-windows/lib/libvpx.a ./${PREFIX}/lib/libvpx.a`, {
			stdio: 'inherit',
		});
		execSync(
			`cp -r vpx-windows/lib/libvpx.dll.a ./${PREFIX}/lib/libvpx.dll.a`,
			{
				stdio: 'inherit',
			},
		);
		execSync(
			`cp -r vpx-windows/lib/pkgconfig/vpx.pc ./${PREFIX}/lib/pkgconfig/vpx.pc`,
			{
				stdio: 'inherit',
			},
		);

		return;
	}

	if (!fs.existsSync(dirname)) {
		// Using newer than 3.100 because it has support for aarch64
		execSync('tar xvf vpx.gz', {
			stdio: 'inherit',
		});
	}

	if (process.platform === 'darwin') {
		execSync(
			`sed "s/,--version-script//g" build/make/Makefile >build/make/Makefile.patched`,
			{
				cwd: dirname,
				stdio: 'inherit',
			},
		);
		execSync(
			`sed "s/-Wl,--no-undefined -Wl,-soname/-Wl,-undefined,error -Wl,-install_name/g" build/make/Makefile.patched >build/make/Makefile`,
			{
				cwd: dirname,
				stdio: 'inherit',
			},
		);
	}

	const configPath = path.join(dirname, 'configure');
	const configureScript = readFileSync(configPath, 'utf-8');

	const configReplaced = configureScript.replace(
		'if ! diff --version >/dev/null; then',
		'if false; then',
	);
	writeFileSync(configPath, configReplaced);

	execSync(
		[
			path.posix.join(process.cwd().replace(/\\/g, '/'), dirname, 'configure'),
			,
			`--prefix=${path.join(process.cwd(), dirname, PREFIX)}`,
			'--enable-static',
			'--disable-shared',
			'--disable-unit-tests',
			'--disable-examples',
			'--enable-pic',
			'--as=yasm',
			isWindows ? '--target=x86_64-win64-gcc' : null,
		].join(' '),
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
};
