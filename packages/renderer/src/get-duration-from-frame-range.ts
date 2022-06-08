import {FrameRange} from 'remotion';

export const getDurationFromFrameRange = (
	frameRange: FrameRange | null,
	durationInFrames: number,
	everyNthFrame: number
) => {
	if (everyNthFrame === 0) {
		throw new Error('everyNthFrame cannot be 0');
	}

	if (frameRange === null) {
		return Math.floor(durationInFrames / everyNthFrame);
	}

	if (typeof frameRange === 'number') {
		return 1;
	}

	return Math.floor((frameRange[1] - frameRange[0] + 1) / everyNthFrame);
};
