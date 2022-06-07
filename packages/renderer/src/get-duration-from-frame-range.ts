import {FrameRange} from 'remotion';

export const getDurationFromFrameRange = (
	frameRange: FrameRange | null,
	durationInFrames: number,
	skipNFrames: number
) => {
	if (frameRange === null) {
		if (skipNFrames === 0) {
			return durationInFrames;
		}

		return Math.floor(durationInFrames / (skipNFrames + 1)) + 1;
	}

	if (typeof frameRange === 'number') {
		return 1;
	}

	if (skipNFrames === 0) {
		return frameRange[1] - frameRange[0] + 1;
	}

	return Math.floor((frameRange[1] - frameRange[0]) / (skipNFrames + 1)) + 1;
};
