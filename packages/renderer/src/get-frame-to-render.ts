import type {FrameRange} from './frame-range';

export const getRealFrameRange = (
	durationInFrames: number,
	frameRange: FrameRange | null
): [number, number] => {
	if (frameRange === null) {
		return [0, durationInFrames - 1];
	}

	if (typeof frameRange === 'number') {
		if (frameRange < 0 || frameRange >= durationInFrames) {
			throw new Error(
				`Frame number is out of range, must be between 0 and ${
					durationInFrames - 1
				} but got ${frameRange}`
			);
		}

		return [frameRange, frameRange];
	}

	if (frameRange[1] >= durationInFrames || frameRange[0] < 0) {
		throw new Error(
			`Frame range ${frameRange.join('-')} is not in between 0-${
				durationInFrames - 1
			}`
		);
	}

	return frameRange;
};
