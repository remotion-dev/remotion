import {ConfigInternals} from '@remotion/config';
import type {ImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const getImageFormat = (
	codec: ReturnType<typeof ConfigInternals.getOutputCodecOrUndefined>
): ImageFormat => {
	const userPreferred = ConfigInternals.getUserPreferredImageFormat();

	if (typeof userPreferred !== 'undefined') {
		return userPreferred;
	}

	if (RenderInternals.isAudioCodec(codec)) {
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
