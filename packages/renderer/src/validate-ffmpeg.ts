import execa from 'execa';
import os from 'os';

export const binaryExists = async (name: string) => {
	const isWin = os.platform() === 'win32';
	const where = isWin ? 'where' : 'which';
	try {
		await execa(where, [name]);
		return true;
	} catch (err) {
		return false;
	}
};

export const isHomebrewInstalled = async (): Promise<boolean> => {
	return binaryExists('brew');
};

export const validateFfmpeg = async (): Promise<void> => {
	const ffmpegExists = await binaryExists('ffmpeg');
	if (!ffmpegExists) {
		throw new Error(
			[
				'It looks like FFMPEG is not installed.',
				os.platform() === 'darwin' && (await isHomebrewInstalled())
					? 'Run `brew install ffmpeg` to install ffmpeg'
					: 'See https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg on how to install FFMPEG.',
			].join('\n')
		);
	}
};
