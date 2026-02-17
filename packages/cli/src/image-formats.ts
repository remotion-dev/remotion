import type {VideoImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import {ConfigInternals} from './config';
import {parsedCli} from './parsed-cli';

const {imageFormatOption} = BrowserSafeApis.options;

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

	const cliImageFormat = imageFormatOption.getValue({
		commandLine: parsedCli,
	}).value;

	if (cliImageFormat !== null) {
		if (
			!(RenderInternals.validVideoImageFormats as readonly string[]).includes(
				cliImageFormat,
			)
		) {
			throw new Error(`Invalid image format: ${cliImageFormat}`);
		}

		return cliImageFormat as VideoImageFormat;
	}

	const configFileOption = ConfigInternals.getUserPreferredVideoImageFormat();

	if (typeof configFileOption !== 'undefined') {
		return configFileOption;
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
