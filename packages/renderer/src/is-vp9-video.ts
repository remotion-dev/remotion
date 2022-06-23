import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {pLimit} from './p-limit';

const durationOfAssetCache: Record<string, boolean> = {};

const limit = pLimit(1);

async function isVp9Videounlimited(
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<boolean> {
	if (typeof durationOfAssetCache[src] !== 'undefined') {
		return durationOfAssetCache[src];
	}

	const task = await execa(ffprobeExecutable ?? 'ffprobe', [src]);

	const result = task.stdout.includes('Video: vp9');

	durationOfAssetCache[src] = result;

	return result;
}

export const checkIfIsVp9Video = (
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<boolean> => {
	return limit(() => isVp9Videounlimited(src, ffprobeExecutable));
};
