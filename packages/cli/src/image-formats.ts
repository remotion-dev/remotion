import type {ImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {ConfigInternals} from './config';

export const getImageFormat = (
	codec: ReturnType<typeof ConfigInternals.getOutputCodecOrUndefined>,
	configFileImageFormat: ReturnType<
		typeof ConfigInternals.getUserPreferredImageFormat
	>
): ImageFormat => {
	if (typeof configFileImageFormat !== 'undefined') {
		return configFileImageFormat;
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
