import {FfmpegVersion} from '@remotion/renderer';
import {Log} from './log';

const printMessage = (ffmpegVersion: NonNullable<FfmpegVersion>) => {
	Log.Warn('⚠️Old FFMPEG version detected: ' + ffmpegVersion.join('.'));
	Log.Warn('   For audio support, you need at least version 4.1.0.');
	Log.Warn('   Upgrade FFMPEG to get rid of this warning.');
};

const printBuildConfMessage = () => {
	Log.Error('⚠️  Unsupported FFMPEG version detected.');
	Log.Error("   Your version doesn't support the -buildconf flag");
	Log.Error(
		'   Audio will not be supported and you may experience other issues.'
	);
	Log.Error('   Upgrade FFMPEG to at least v4.1.0 to get rid of this warning.');
};

export const warnAboutFfmpegVersion = ({
	ffmpegVersion,
	buildConf,
}: {
	ffmpegVersion: FfmpegVersion;
	buildConf: string | null;
}) => {
	if (buildConf === null) {
		printBuildConfMessage();
		return;
	}
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
