import {Codec} from 'remotion';

export type FrameFormat = 'png' | 'jpeg';

export const getFrameFormat = (format: Codec): FrameFormat => {
	if (
		format === 'h264' ||
		format === 'h265' ||
		format === 'vp8' ||
		format === 'vp9'
	) {
		return 'jpeg';
	}
	if (format === 'png') {
		return 'png';
	}
	throw new Error('Unrecognized render mode ' + format);
};
