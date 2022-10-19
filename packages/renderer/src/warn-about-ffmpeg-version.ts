import type {FfmpegVersion} from './ffmpeg-flags';

const printMessage = (ffmpegVersion: NonNullable<FfmpegVersion>) => {
	console.warn('⚠️Old FFMPEG version detected: ' + ffmpegVersion.join('.'));
	console.warn('   For audio support, you need at least version 4.1.0.');
	console.warn('   Upgrade FFMPEG to get rid of this warning.');
};

const printBuildConfMessage = () => {
	console.error('⚠️  Unsupported FFMPEG version detected.');
	console.error("   Your version doesn't support the -buildconf flag");
	console.error(
		'   Audio will not be supported and you may experience other issues.'
	);
	console.error(
		'   Upgrade FFMPEG to at least v4.1.0 to get rid of this warning.'
	);
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
	}
};
