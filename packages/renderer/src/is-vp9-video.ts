import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {pLimit} from './p-limit';

export type SpecialVCodecForTransparency = 'vp9' | 'vp8' | 'none';

const isVp9VideoCache: Record<string, SpecialVCodecForTransparency> = {};

const limit = pLimit(1);

async function getSpecialVCodecForTransparencyUnlimited(
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<SpecialVCodecForTransparency> {
	if (typeof isVp9VideoCache[src] !== 'undefined') {
		return isVp9VideoCache[src];
	}

	const task = await execa(ffprobeExecutable ?? 'ffprobe', [src]);

	const isVp9 = task.stderr.includes('Video: vp9');
	const isVp8 = task.stderr.includes('Video: vp8');

	isVp9VideoCache[src] = isVp9 ? 'vp9' : isVp8 ? 'vp8' : 'none';

	return isVp9VideoCache[src];
}

export const getSpecialVCodecForTransparency = (
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<SpecialVCodecForTransparency> => {
	return limit(() =>
		getSpecialVCodecForTransparencyUnlimited(src, ffprobeExecutable)
	);
};
