import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {pLimit} from './p-limit';

const isVp9VideoCache: Record<string, boolean> = {};

const limit = pLimit(1);

async function isVp9VideoUnlimited(
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<boolean> {
	if (typeof isVp9VideoCache[src] !== 'undefined') {
		return isVp9VideoCache[src];
	}

	const task = await execa(ffprobeExecutable ?? 'ffprobe', [src]);

	const result = task.stderr.includes('Video: vp9');

	isVp9VideoCache[src] = result;

	return result;
}

export const checkIfIsVp9Video = (
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<boolean> => {
	return limit(() => isVp9VideoUnlimited(src, ffprobeExecutable));
};
