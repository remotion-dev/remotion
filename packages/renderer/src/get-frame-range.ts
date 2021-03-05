import {FrameRange} from 'remotion';

export const getFrameCount = (
	totalDuration: number,
	frameRange: FrameRange | null
): number => {
	const frames = totalDuration;

	if (!frameRange) {
		return totalDuration;
	}

	if (typeof frameRange === 'number') {
		if (frameRange < 0) {
			throw new Error('Frame number must be positive, got ' + frameRange);
		}
		if (frameRange >= frames) {
			throw new Error(
				`Frame number is out of range, must be between 0 and ${frames - 1}`
			);
		}
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
