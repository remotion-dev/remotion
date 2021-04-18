import {FfmpegVersion} from '@remotion/renderer';
import {Log} from './log';

export const printMessage = (ffmpegVersion: NonNullable<FfmpegVersion>) => {
	Log.Warn('Old FFMPEG version detected: ' + ffmpegVersion.join('.'));
	Log.Warn('For audio support, you need at least version 4.1.0.');
	Log.Warn('Upgrade FFMPEG to get rid of this warning.');
};

export const warnAboutFfmpegVersion = (ffmpegVersion: FfmpegVersion) => {
	if (ffmpegVersion === null) {
		return null;
	}
	const [major, minor] = ffmpegVersion;
	// 3.x and below definitely is too old
	if (major < 4) {
		printMessage(ffmpegVersion);
		return;
	}
	// 5.x will be all good
	if (major > 4) {
		return;
	}
	if (minor < 1) {
		printMessage(ffmpegVersion);
		return;
	}
};
