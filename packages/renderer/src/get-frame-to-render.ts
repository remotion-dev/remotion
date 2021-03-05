import {FrameRange} from 'remotion';

export const getFrameToRender = (frameRange: FrameRange, index: number) => {
	if (typeof frameRange === 'object' && frameRange !== null) {
		return index + frameRange[0] - 1;
	}
	if (typeof frameRange === 'number') {
		return frameRange;
	}
	return index;
};
