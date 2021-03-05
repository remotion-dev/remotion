import {FrameRange, Internals} from 'remotion';

export const getFrameCount = (
	totalDuration: number,
	frameRange: FrameRange | null
): number => {
	Internals.validateFrameRange(frameRange);

	if (!frameRange) {
		return totalDuration;
	}

	if (typeof frameRange === 'number') {
		return 1;
	}

	const [start, end] = frameRange;
	return end - start + 1;
};
