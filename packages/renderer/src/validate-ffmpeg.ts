import execa from 'execa';
import os from 'os';

export const isHomebrewInstalled = async (): Promise<boolean> => {
	const isWin = os.platform().indexOf('win') > -1;

	const where = isWin ? 'where' : 'whereis';
	try {
		await execa(where, ['brew']);
		return true;
	} catch (err) {
		return false;
	}
};

export const validateFfmpeg = async (): Promise<boolean> => {
	const isWin = os.platform().indexOf('win') > -1;

	const where = isWin ? 'where' : 'whereis';
	try {
		await execa(where, ['ffmpeg']);
		return true;
	} catch (err) {
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
