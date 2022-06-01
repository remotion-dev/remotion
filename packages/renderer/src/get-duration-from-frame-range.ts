import {FrameRange} from 'remotion';

export const getDurationFromFrameRange = (
	frameRange: FrameRange | null,
	durationInFrames: number
) => {
	if (frameRange === null) {
		return durationInFrames;
	}

	if (typeof frameRange === 'number') {
		return 1;
	}

	return frameRange[1] - frameRange[0] + 1;
};
