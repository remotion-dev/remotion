import type {VideoImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {parsedCli} from './parse-command-line';

export const getVideoImageFormat = (
	codec: ReturnType<typeof ConfigInternals.getOutputCodecOrUndefined>
): VideoImageFormat => {
	const configFileOption = ConfigInternals.getUserPreferredVideoImageFormat();

	if (typeof configFileOption !== 'undefined') {
		return configFileOption;
	}

	if (typeof parsedCli['image-format'] !== 'undefined') {
		if (
			!(RenderInternals.validVideoImageFormats as readonly string[]).includes(
				parsedCli['image-format'] as string
			)
		) {
			throw new Error(`Invalid image format: ${parsedCli['image-format']}`);
		}

		return parsedCli['image-format'] as VideoImageFormat;
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
