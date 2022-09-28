import execa from 'execa';
import type { FfmpegExecutable } from './ffmpeg-executable';
import {binaryExists, ffmpegInNodeModules} from './validate-ffmpeg';

let buildConfig: string | null = null;

export type FfmpegVersion = [number, number, number] | null;

// executes ffmpeg with execa in order to get buildInfos which then can be used elsewhere?
export const getFfmpegBuildInfo = async (options: {
	ffmpegExecutable: string | null;
}) => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa(
		await getExecutableFfmpeg(options.ffmpegExecutable),
		// options.ffmpegExecutable ?? 'ffmpeg',
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

	// cant have feature if ffmpeg doesnt even exist
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

// should check if ffmpeg is installed. If installed, return "ffmpeg" else return path to ffmpeg.exe in node modules
export const getExecutableFfmpeg = async (ffmpegExecutable: FfmpegExecutable | null) => {
	
	const os = require('os');
	const isWin = os.platform() === 'win32';
	console.log("is win? " , isWin)
	const path = require('path');
	if (await binaryExists('ffmpeg', ffmpegExecutable)) {
		return 'ffmpeg';
	}

	if (await ffmpegInNodeModules()){
		if(!isWin){
			console.log("yes, this is mac")
			return (path.resolve(__dirname, '..', 'node_modules/.ffmpeg/ffmpeg'));
		}

			return path.resolve(
			__dirname,
				'..',
				'node_modules/.ffmpeg/ffmpeg-2022-09-19-full_build/bin',
				'ffmpeg.exe'
			);
	}



	





};
