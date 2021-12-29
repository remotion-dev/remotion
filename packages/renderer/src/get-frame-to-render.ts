import {FrameRange} from 'remotion';

export const getFrameToRender = (
	frameRange: FrameRange | null,
	index: number
) => {
	if (typeof frameRange === 'object' && frameRange !== null) {
		return index + frameRange[0];
	}

	if (typeof frameRange === 'number') {
		return frameRange;
	}

	return index;
};
