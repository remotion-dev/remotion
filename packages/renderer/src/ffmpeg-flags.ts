import execa from 'execa';
import {binaryExists} from './validate-ffmpeg';

let buildConfig: string | null = null;

export type FfmpegVersion = [number, number, number] | null;

export const getFfmpegBuildInfo = async (options: {
	ffmpegExecutable: string | null;
}) => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa(
		options.ffmpegExecutable ?? 'ffmpeg',
		['-buildconf'],
		{
			reject: false,
		}
	);
	buildConfig = data.stderr;
	return buildConfig;
};

export const ffmpegHasFeature = async ({
	ffmpegExecutable,
	feature,
}: {
	ffmpegExecutable: string | null;
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx';
}) => {
	if (!binaryExists('ffmpeg', ffmpegExecutable)) {
		return false;
	}

	const config = await getFfmpegBuildInfo({ffmpegExecutable});
	return config.includes(feature);
};

export const parseFfmpegVersion = (buildconf: string): FfmpegVersion => {
	const match = buildconf.match(
		/ffmpeg version ([0-9]+).([0-9]+)(?:.([0-9]+))?/
	);
	if (!match) {
		return null;
	}

	return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
};

export const getFfmpegVersion = async (options: {
	ffmpegExecutable: string | null;
}): Promise<FfmpegVersion> => {
	const buildInfo = await getFfmpegBuildInfo({
		ffmpegExecutable: options.ffmpegExecutable,
	});
	return parseFfmpegVersion(buildInfo);
};

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
