import {FrameRange} from 'remotion';

export const getFrameCount = (
	totalDuration: number,
	frameRange: FrameRange
): number => {
	const frames = totalDuration;

	if (!frameRange) {
		return totalDuration;
	}

	if (typeof frameRange === 'number') {
		return 1;
	}

	if (frameRange.length !== 2) {
		throw new Error('Frame range must be between 1 and 2 numbers');
	}
	if (frameRange[1] > frames || frameRange[0] < 0) {
		throw new Error(
			`Frame range ${
				frameRange[0] - frameRange[1]
			} is not in between 0-${frames}`
		);
	}
	return frameRange[1] - frameRange[0] + 1;
};
