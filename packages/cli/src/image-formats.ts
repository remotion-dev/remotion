import {OutputFormat} from 'remotion';

export type FrameFormat = 'png' | 'jpeg';

export const getFrameFormat = (format: OutputFormat): FrameFormat => {
	if (
		format === 'mp4' ||
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
