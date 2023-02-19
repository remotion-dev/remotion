import execa from 'execa';
import path from 'path';
import {getExecutablePath} from './compositor/get-executable-path';
import {truthy} from './truthy';

export const callFfExtraOptions = () => {
	return {
		cwd: getExecutablePath('ffmpeg-cwd'),
		env:
			process.platform === 'darwin'
				? undefined
				: {
						LD_LIBRARY_PATH: path.join(getExecutablePath('ffmpeg-cwd'), 'lib'),
				  },
	};
};

export const callFf = (
	bin: 'ffmpeg' | 'ffprobe',
	args: (string | null)[],
	options?: execa.Options<string>
) => {
	return execa(getExecutablePath(bin), args.filter(truthy), {
		...callFfExtraOptions(),
		...options,
	});
};
