import {existsSync} from 'fs';
import os from 'os';
import {
	downloadBinary,
	ffmpegInNodeModules,
	getBinaryDownloadUrl,
	lambdaFfmpegPaths,
} from './ffmpeg-flags';
import {binaryExists} from './validate-ffmpeg';

export type EnsureFfmpegOptions = {
	remotionRoot?: string;
};

type Result = {
	result: 'found-in-path' | 'found-in-node-modules' | 'installed';
	wasAlreadyInstalled: boolean;
};

const ensureFfmpegOrFfprobe = async (
	binary: 'ffmpeg' | 'ffprobe',
	options?: EnsureFfmpegOptions
): Promise<Result> => {
	const exists = binaryExists(binary);

	const remotionRoot = options?.remotionRoot ?? process.cwd();

	if (exists) {
		return {
			wasAlreadyInstalled: true,
			result: 'found-in-path',
		};
	}

	if (process.platform === 'linux' && existsSync(lambdaFfmpegPaths[binary])) {
		return {
			wasAlreadyInstalled: true,
			result: 'found-in-path',
		};
	}

	if (ffmpegInNodeModules(remotionRoot, binary)) {
		return {
			result: 'found-in-node-modules',
			wasAlreadyInstalled: true,
		};
	}

	const binaryUrl = getBinaryDownloadUrl(binary);

	if (binaryUrl) {
		await downloadBinary(remotionRoot, binaryUrl.url, binary);
		return {
			result: 'installed',
			wasAlreadyInstalled: false,
		};
	}

	throw new Error(
		`${binary} could not be installed automatically. Your architecture and OS combination (os = ${os.platform()}, arch = ${
			process.arch
		}) is not supported. Please install ${binary} manually and add "${binary}" to your PATH.`
	);
};

export const ensureFfmpeg = (options?: EnsureFfmpegOptions) => {
	return ensureFfmpegOrFfprobe('ffmpeg', options);
};

export const ensureFfprobe = (options?: EnsureFfmpegOptions) => {
	return ensureFfmpegOrFfprobe('ffprobe', options);
};
