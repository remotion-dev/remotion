import {FrameRange} from 'remotion';

export const getFrameRange = (
	totalDuration: number,
	frameRange: FrameRange
) => {
	let frames = totalDuration;

	if (!frameRange) {
		return frames;
	}

	if (frameRange.length === 1) {
		if (frameRange[0] > frames) {
			throw new Error(
				`Frame range ${frameRange[0]} is greater than actual ${frames}`
			);
		}
		frames = 1;
	}
	if (frameRange.length === 2) {
		if (frameRange[1] > frames || frameRange[0] < 0) {
			throw new Error(
				`Frame range ${
					frameRange[0] - frameRange[1]
				} is not in between 0-${frames}`
			);
		}
		frames = frameRange[1] - frameRange[0] + 1;
	}
	return frames;
};
