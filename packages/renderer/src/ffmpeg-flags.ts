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
	isLambda,
}: {
	ffmpegExecutable: string | null;
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx';
	isLambda: boolean;
}) => {
	if (isLambda) {
		// When rendering in the cloud, we don't need a local binary
		return true;
	}

	if (!(await binaryExists('ffmpeg', ffmpegExecutable))) {
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
