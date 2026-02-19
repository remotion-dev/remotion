import type {VideoImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {ConfigInternals} from './config';
import {parsedCli} from './parsed-cli';

export const getVideoImageFormat = ({
	codec,
	uiImageFormat,
}: {
	codec: ReturnType<typeof ConfigInternals.getOutputCodecOrUndefined>;
	uiImageFormat: VideoImageFormat | null;
}): VideoImageFormat => {
	if (uiImageFormat !== null) {
		return uiImageFormat;
	}

	const configured = BrowserSafeApis.options.videoImageFormatOption.getValue({
		commandLine: parsedCli,
	}).value;

	if (configured !== null) {
		return configured;
	}

	if (NoReactAPIs.isAudioCodec(codec)) {
		return 'none';
	}

	if (
		codec === 'h264' ||
		codec === 'h264-mkv' ||
		codec === 'h264-ts' ||
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
