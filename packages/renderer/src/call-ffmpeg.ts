import {execSync} from 'child_process';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import {getExecutablePath} from './compositor/get-executable-path';
import {truthy} from './truthy';

export const callFfExtraOptions = () => {
	const isLambda = /^AWS_Lambda_nodejs(?:18)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? ''
	);
	const lib = path.join(
		getExecutablePath('ffmpeg-cwd', isLambda),
		'remotion',
		'lib'
	);

	console.log({lib});
	console.log({files: fs.readdirSync(lib)});
	execSync('ldd ' + lib + '/libavdevice.so', {
		cwd: lib,
		stdio: 'inherit',
		env: {
			LD_LIBRARY_PATH: `${process.env.LD_LIBRARY_PATH};${lib}`,
		},
	});

	console.log('deps');
	execSync('ldd ' + '/opt/ffmpeg/remotion/bin/ffmpeg', {
		cwd: lib,
		stdio: 'inherit',
		env: {LD_LIBRARY_PATH: `${process.env.LD_LIBRARY_PATH};${lib}`},
	});
	console.log('deps2');

	return {
		env:
			process.platform === 'darwin'
				? {
						DYLD_LIBRARY_PATH: lib,
				  }
				: process.platform === 'win32'
				? {
						PATH: `${process.env.PATH};${lib}`,
				  }
				: {
						LD_LIBRARY_PATH: `${process.env.LD_LIBRARY_PATH};${lib}`,
				  },
	};
};

export const callFf = (
	bin: 'ffmpeg' | 'ffprobe',
	args: (string | null)[],
	options?: execa.Options<string>
) => {
	const isLambda = /^AWS_Lambda_nodejs(?:18)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? ''
	);
	return execa(getExecutablePath(bin, isLambda), args.filter(truthy), {
		...callFfExtraOptions(),
		...options,
	});
};
