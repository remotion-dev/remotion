import execa from 'execa';
import path from 'path';
import {getExecutablePath} from './compositor/get-executable-path';
import {truthy} from './truthy';

export const dynamicLibraryPathOptions = () => {
	const lib = path.join(getExecutablePath('ffmpeg-cwd'), 'remotion', 'lib');

	return {
		env: {
			RUST_BACKTRACE: 'full',
			...(process.platform === 'darwin'
				? {
						DYLD_LIBRARY_PATH: lib,
				  }
				: process.platform === 'win32'
				? {
						PATH: `${process.env.PATH};${lib}`,
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
	options?: execa.Options<string>
) => {
	return execa(getExecutablePath(bin), args.filter(truthy), {
		...dynamicLibraryPathOptions(),
		...options,
	});
};
