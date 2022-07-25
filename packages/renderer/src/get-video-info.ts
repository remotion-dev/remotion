import execa from 'execa';
import {calculateDisplayVideoSize} from './calculate-sar-dar-pixels';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {pLimit} from './p-limit';

type Result = {
	specialVcodec: SpecialVCodecForTransparency;
	needsResize: [number, number] | null;
};

export type SpecialVCodecForTransparency = 'vp9' | 'vp8' | 'none';

const isVp9VideoCache: Record<string, Result> = {};

const limit = pLimit(1);

async function getVideoInfoUnlimited(
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<Result> {
	if (typeof isVp9VideoCache[src] !== 'undefined') {
		return isVp9VideoCache[src];
	}

	const task = await execa(ffprobeExecutable ?? 'ffprobe', [src]);

	const isVp9 = task.stderr.includes('Video: vp9');
	const isVp8 = task.stderr.includes('Video: vp8');

	const dimensions = task.stderr
		.split('\n')
		.find((n) => n.trim().startsWith('Stream #'))
		?.match(/([0-9]{2,6})x([0-9]{2,6})/);
	const dar = task.stderr.match(/DAR\s([0-9]+):([0-9]+)/);

	let needsResize: null | [number, number] = null;

	if (dimensions && dar) {
		const width = parseInt(dimensions[1], 10);
		const height = parseInt(dimensions[2], 10);
		const darWidth = parseInt(dar[1], 10);
		const darHeight = parseInt(dar[2], 10);

		const {width: actualWidth, height: actualHeight} =
			calculateDisplayVideoSize({
				darX: darWidth,
				darY: darHeight,
				x: width,
				y: height,
			});

		if (actualWidth !== width || actualHeight !== height) {
			needsResize = [actualWidth, actualHeight];
		}
	}

	const result: Result = {
		specialVcodec: isVp9 ? 'vp9' : isVp8 ? 'vp8' : 'none',
		needsResize,
	};

	isVp9VideoCache[src] = result;

	return isVp9VideoCache[src];
}

export const getVideoInfo = (
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<Result> => {
	return limit(() => getVideoInfoUnlimited(src, ffprobeExecutable));
};
