import {Codec, ImageFormat} from 'remotion';

export const getImageFormat = (codec: Codec): ImageFormat => {
	if (
		codec === 'h264' ||
		codec === 'h265' ||
		codec === 'vp8' ||
		codec === 'vp9'
	) {
		return 'jpeg';
	}
	if (codec === 'png') {
		return 'png';
	}
	throw new Error('Unrecognized codec ' + codec);
};
