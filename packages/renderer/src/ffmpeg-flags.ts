import execa from 'execa';
import {validateFfmpeg} from './validate-ffmpeg';

let buildConfig: string | null = null;

const getFfmpegBuildInfo = async () => {
	if (buildConfig !== null) {
		return buildConfig;
	}
	await validateFfmpeg();
	const data = await execa('ffmpeg', ['-buildconf']);
	buildConfig = data.stderr;
	return buildConfig;
};

export const ffmpegHasFeature = async (
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx'
) => {
	const config = await getFfmpegBuildInfo();
	return config.includes(feature);
};
