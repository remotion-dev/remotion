import {ensureFfmpeg, ensureFfprobe} from '@remotion/renderer';
import {Log} from './log';

export const INSTALL_COMMAND = 'install' as const;

export const installCommand = async (remotionRoot: string, args: string[]) => {
	const firstArg = args[0];
	if (firstArg === 'ffmpeg') {
		const {wasAlreadyInstalled} = await ensureFfmpeg({remotionRoot});
		if (wasAlreadyInstalled) {
			Log.info('FFmpeg is already installed');
		} else {
			Log.info('Successfully installed FFmpeg');
		}

		return;
	}

	if (firstArg === 'ffprobe') {
		const {wasAlreadyInstalled} = await ensureFfprobe({remotionRoot});
		if (wasAlreadyInstalled) {
			Log.info('FFmpeg is already installed');
		} else {
			Log.info('Successfully installed FFmpeg');
		}

		return;
	}

	Log.error(
		'Please specify either "ffmpeg" or "ffprobe" as the first argument to the install command'
	);
	Log.error();

	Log.info('Example Usage: ');
	Log.info(' remotion install ffmpeg');
	Log.info(' remotion install ffprobe');

	process.exit(1);
};
