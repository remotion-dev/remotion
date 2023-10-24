import execa from 'execa';
import {chmodSync} from 'node:fs';
import path from 'node:path';
import {getExecutablePath} from './compositor/get-executable-path';
import type {LogLevel} from './log-level';
import {truthy} from './truthy';

export const dynamicLibraryPathOptions = (
	indent: boolean,
	logLevel: LogLevel,
) => {
	const lib = path.join(
		getExecutablePath('ffmpeg-cwd', indent, logLevel),
		'remotion',
		'lib',
	);

	return {
		env: {
			RUST_BACKTRACE: 'full',
			...(process.platform === 'darwin'
				? {
						DYLD_LIBRARY_PATH: lib,
				  }
				: process.platform === 'win32'
				? {
						PATH: `${lib};${process.env.PATH}`,
				  }
				: {
						LD_LIBRARY_PATH: lib,
				  }),
		},
	};
};

export const callFf = (
	bin: 'ffmpeg' | 'ffprobe',
	args: (string | null)[],
	indent: boolean,
	logLevel: LogLevel,
	options?: execa.Options<string>,
) => {
	const executablePath = getExecutablePath(bin, indent, logLevel);
	if (!process.env.READ_ONLY_FS) {
		chmodSync(executablePath, 0o755);
	}

	return execa(executablePath, args.filter(truthy), {
		...dynamicLibraryPathOptions(indent, logLevel),
		...options,
	});
};
