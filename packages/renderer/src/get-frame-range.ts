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
		if (frameRange < 0 || frameRange >= totalDuration) {
			throw new Error(
				`Frame number is out of range, must be between 0 and ${
					totalDuration - 1
				} but got ${frameRange}`
			);
		}

		return 1;
	}

	const [start, end] = frameRange;

	if (frameRange[1] >= totalDuration || frameRange[0] < 0) {
		throw new Error(
			`Frame range ${frameRange.join('-')} is not in between 0-${
				totalDuration - 1
			}`
		);
	}

	return end - start + 1;
};
