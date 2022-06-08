import {FrameRange} from 'remotion';

export const getDurationFromFrameRange = (
	frameRange: FrameRange | null,
	durationInFrames: number,
	everyNthFrame: number
) => {
	if (frameRange === null) {
		if (everyNthFrame === 0) {
			return durationInFrames;
		}

		return Math.floor(durationInFrames / (everyNthFrame + 1)) + 1;
	}

	if (typeof frameRange === 'number') {
		return 1;
	}

	if (everyNthFrame === 0) {
		return frameRange[1] - frameRange[0] + 1;
	}

	return Math.floor((frameRange[1] - frameRange[0]) / (everyNthFrame + 1)) + 1;
};
