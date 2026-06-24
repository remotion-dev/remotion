import type {VideoImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {ConfigInternals} from './config';
import {parsedCli} from './parsed-cli';

export const getVideoImageFormat = ({
	codec,
	uiImageFormat,
	compositionDefaultVideoImageFormat,
}: {
	codec: ReturnType<typeof ConfigInternals.getOutputCodecOrUndefined>;
	uiImageFormat: VideoImageFormat | null;
	compositionDefaultVideoImageFormat: VideoImageFormat | null;
}): VideoImageFormat => {
	if (uiImageFormat !== null) {
		return uiImageFormat;
	}

	const imageFormatOption =
		BrowserSafeApis.options.videoImageFormatOption.getValue({
			commandLine: parsedCli,
		});

	if (imageFormatOption.source === 'cli' && imageFormatOption.value !== null) {
		return imageFormatOption.value;
	}

	if (compositionDefaultVideoImageFormat !== null) {
		return compositionDefaultVideoImageFormat;
	}

	if (imageFormatOption.value !== null) {
		return imageFormatOption.value;
	}

	if (NoReactAPIs.isAudioCodec(codec)) {
		return 'none';
	}

	if (
		codec === 'h264' ||
		codec === 'h264-mkv' ||
		codec === 'h264-ts' ||
		codec === 'h265' ||
		codec === 'av1' ||
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
