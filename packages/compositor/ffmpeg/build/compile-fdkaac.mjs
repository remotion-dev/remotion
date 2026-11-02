import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {PREFIX} from './const.mjs';

export const enableFdkAac = async (isWindows) => {
	if (!fs.existsSync('fdk-aac-free-2.0.0')) {
		const response = execSync(
			// Free version of fdk-aac, without any license issues
			// https://src.fedoraproject.org/rpms/fdk-aac-free/tree/rawhide
			// https://en.wikipedia.org/wiki/Fraunhofer_FDK_AAC
			// > However, Fedora states that this will not affect the fdk-aac-free package, which enables only the commonly used "Low Complexity AAC" profile, which is what most people use.
			'curl -L https://people.freedesktop.org/~wtay/fdk-aac-free-2.0.0.tar.gz > fdkaac.tar.gz',
		);
		execSync('tar -xzf fdkaac.tar.gz', {
			stdio: 'inherit',
		});
	}

	execSync('autoreconf -vif', {cwd: 'fdk-aac-free-2.0.0'});

	execSync(
		[
			path.posix.join(
				process.cwd().replace(/\\/g, '/'),
				'fdk-aac-free-2.0.0',
				'configure',
			),
			`--prefix=${path.resolve('fdk-aac-free-2.0.0', PREFIX)}`,
			'--enable-static',
			'--disable-shared',
			'--with-pic',
			isWindows ? '--host=x86_64-w64-mingw32' : null,
		]
			.filter(Boolean)
			.join(' '),
		{
			cwd: 'fdk-aac-free-2.0.0',
			stdio: 'inherit',
		},
	);

	execSync('make', {
		cwd: 'fdk-aac-free-2.0.0',
		stdio: 'inherit',
	});

	execSync('make install', {
		cwd: 'fdk-aac-free-2.0.0',
		stdio: 'inherit',
	});

	execSync(`cp -r ${PREFIX} ../`, {
		cwd: 'fdk-aac-free-2.0.0',
		stdio: 'inherit',
	});
};
