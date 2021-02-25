import {ImageFormat, Internals} from 'remotion';

export const getImageFormat = (
	codec: ReturnType<typeof Internals.getOutputCodecOrUndefined>
): ImageFormat => {
	const userPreferred = Internals.getUserPreferredImageFormat();

	if (typeof userPreferred !== 'undefined') {
		return userPreferred;
	}
	if (
		codec === 'h264' ||
		codec === 'h265' ||
		codec === 'vp8' ||
		codec === 'vp9'
	) {
		return 'jpeg';
	}
	if (codec === undefined) {
		return 'png';
	}
	throw new Error('Unrecognized codec ' + codec);
};
