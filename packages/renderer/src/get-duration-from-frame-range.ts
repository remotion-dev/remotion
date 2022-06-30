import type {FrameRange} from 'remotion';

export const getFramesToRender = (
	frameRange: FrameRange | null,
	durationInFrames: number,
	everyNthFrame: number
): number[] => {
	if (everyNthFrame === 0) {
		throw new Error('everyNthFrame cannot be 0');
	}

	if (frameRange === null) {
		return new Array(durationInFrames)
			.fill(true)
			.map((_, index) => {
				return index;
			})
			.filter((index) => {
				return index % everyNthFrame === 0;
			});
	}

	if (typeof frameRange === 'number') {
		return [frameRange];
	}

	return new Array(frameRange[1] - frameRange[0] + 1)
		.fill(true)
		.map((_, index) => {
			return index + frameRange[0];
		})
		.filter((index) => {
			return index % everyNthFrame === 0;
		});
};
