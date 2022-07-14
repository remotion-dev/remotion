import type {ImageFormat} from 'remotion';
import { Internals} from 'remotion';

export const getImageFormat = (
	codec: ReturnType<typeof Internals.getOutputCodecOrUndefined>
): ImageFormat => {
	const userPreferred = Internals.getUserPreferredImageFormat();

	if (typeof userPreferred !== 'undefined') {
		return userPreferred;
	}

	if (Internals.isAudioCodec(codec)) {
		return 'none';
	}

	if (
		codec === 'h264' ||
		codec === 'h264-mkv' ||
		codec === 'h265' ||
		codec === 'vp8' ||
		codec === 'vp9' ||
		codec === 'prores' ||
		codec === 'gif'
	) {
		return 'jpeg';
	}

	if (codec === undefined) {
		return 'png';
	}

	throw new Error('Unrecognized codec ' + codec);
};
