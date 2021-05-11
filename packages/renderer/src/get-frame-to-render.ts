import {FrameRange} from 'remotion';

export const getFrameToRender = (
	frameRange: FrameRange | null,
	index: number
) => {
	if (typeof frameRange === 'object' && frameRange !== null) {
		// todo document change
		return index + frameRange[0];
	}

	if (typeof frameRange === 'number') {
		return frameRange;
	}

	return index;
};
