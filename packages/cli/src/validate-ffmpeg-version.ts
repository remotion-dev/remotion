import {RenderInternals} from '@remotion/renderer';
import {Log} from './log';
import {warnAboutFfmpegVersion} from './warn-about-ffmpeg-version';

export const checkAndValidateFfmpegVersion = async () => {
	const ffmpegVersion = await RenderInternals.getFfmpegVersion();
	Log.Verbose(
		'Your FFMPEG version:',
		ffmpegVersion ? ffmpegVersion.join('.') : 'Built from source'
	);
	warnAboutFfmpegVersion(ffmpegVersion);
};
