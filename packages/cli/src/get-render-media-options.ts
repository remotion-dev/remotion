import type {Codec, RenderMediaOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {getResolvedAudioCodec} from './get-audio-codec';
import {getCliOptions} from './get-cli-options';
import {getImageFormat} from './image-formats';

export const getRenderMediaOptions = async ({
	outputLocation,
	config,
	serveUrl,
	codec,
	remotionRoot,
}: {
	outputLocation: RenderMediaOptions['outputLocation'];
	config: RenderMediaOptions['composition'];
	serveUrl: string;
	codec: Codec;
	remotionRoot: string;
}): Promise<RenderMediaOptions> => {
	const {
		proResProfile,
		concurrency,
		frameRange,
		overwrite,
		inputProps,
		envVariables,
		quality,
		crf,
		pixelFormat,
		browserExecutable,
		scale,
		chromiumOptions,
		port,
		numberOfGifLoops,
		everyNthFrame,
		muted,
		enforceAudioTrack,
		ffmpegOverride,
		audioBitrate,
		videoBitrate,
		height,
		width,
	} = await getCliOptions({
		isLambda: false,
		type: 'series',
		remotionRoot,
	});

	const imageFormat = getImageFormat(codec);
	const audioCodec = getResolvedAudioCodec();

	return {
		outputLocation,
		composition: {
			...config,
			width: width ?? config.width,
			height: height ?? config.height,
		},
		crf,
		envVariables,
		frameRange,
		imageFormat,
		inputProps,
		overwrite,
		pixelFormat,
		proResProfile,
		quality,
		dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		chromiumOptions,
		timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
		scale,
		port,
		numberOfGifLoops,
		everyNthFrame,
		verbose: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		muted,
		enforceAudioTrack,
		browserExecutable,
		ffmpegOverride,
		concurrency,
		serveUrl,
		codec,
		audioBitrate,
		videoBitrate,
		audioCodec,
	};
};
