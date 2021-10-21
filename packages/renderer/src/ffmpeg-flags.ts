import execa from 'execa';
import {binaryExists} from './validate-ffmpeg';

let buildConfig: string | null = null;

export type FfmpegVersion = [number, number, number] | null;

export const getFfmpegBuildInfo = async () => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa('ffmpeg', ['-buildconf']);
	buildConfig = data.stderr;
	return buildConfig;
};

export const ffmpegHasFeature = async (factors: {
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx';
	isLambda: boolean;
}) => {
	// Lambda should have all features
	if (factors.isLambda) {
		return true;
	}

	if (!binaryExists('ffmpeg')) {
		return false;
	}

	const config = await getFfmpegBuildInfo();
	return config.includes(factors.feature);
};

export const parseFfmpegVersion = (buildconf: string): FfmpegVersion => {
	const match = buildconf.match(/ffmpeg version ([0-9]+).([0-9]+).([0-9]+)/);
	if (!match) {
		return null;
	}

	return [Number(match[1]), Number(match[2]), Number(match[3])];
};

export const getFfmpegVersion = async (): Promise<FfmpegVersion> => {
	const buildInfo = await getFfmpegBuildInfo();
	return parseFfmpegVersion(buildInfo);
};
