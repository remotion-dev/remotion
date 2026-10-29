import {execSync} from 'child_process';
import {dir} from 'console';
import fs, {existsSync, readFileSync, copyFileSync, mkdirSync} from 'fs';
import path from 'path';
import {PREFIX} from './const.mjs';

const dirname = 'opus-1.3.1';

export const enableOpus = (isWindows) => {
	if (!existsSync(dirname)) {
		execSync('tar xvf opus.gz', {
			stdio: 'inherit',
		});
	}

	execSync(
		[
			path.posix.join(process.cwd().replace(/\\/g, '/'), dirname, 'configure'),
			`--prefix=${path.join(process.cwd(), dirname, PREFIX)}`,
			'--enable-static',
			'--disable-shared',
			'--with-pic',
			'--enable-custom-modes',
			'--disable-extra-programs',
			isWindows ? '--host=x86_64-w64-mingw32' : null,
		].join(' '),
		{cwd: dirname, stdio: 'inherit'},
	);

	execSync('make', {
		cwd: dirname,
		stdio: 'inherit',
	});

	execSync('make install', {
		cwd: dirname,
		stdio: 'inherit',
	});

	const opus = readFileSync(
		dirname + '/remotion/lib/pkgconfig/opus.pc',
		'utf8',
	);
	console.log('pkgconfig/opus.pc is:', opus);
	const lines = opus.split('\n');
	const privLibs = lines.find((line) => line.startsWith('Libs.private'));
	if (!privLibs) {
		throw new Error('Could not find Libs.private in opus.pc');
	}
	const extraLibs = privLibs.replace('Libs.private: ', '');
	const linesPkg = lines
		.map((line) => {
			if (line.startsWith('prefix=')) {
				return 'prefix=remotion';
			}

			if (line.startsWith('Libs:')) {
				// https://github.com/msys2/MINGW-packages/issues/5868#issuecomment-544107564
				return [line, '-lm', isWindows ? '-lssp' : null]
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
	fs.writeFileSync(dirname + '/remotion/lib/pkgconfig/opus.pc', linesPkg);

	execSync(`cp -r ${PREFIX} ../`, {cwd: dirname, stdio: 'inherit'});
};
