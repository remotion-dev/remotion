import type {Codec, FrameRange, RenderMediaOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {getCliOptions} from './get-cli-options';
import {getImageFormat} from './image-formats';

export const getRenderMediaOptions = async ({
	outputLocation,
	config,
	serveUrl,
	codec,
	remotionRoot,
	uiImageFormat,
	uiCrf,
	uiFrameRange,
}: {
	outputLocation: RenderMediaOptions['outputLocation'];
	config: RenderMediaOptions['composition'];
	serveUrl: string;
	codec: Codec;
	remotionRoot: string;
	uiImageFormat: 'png' | 'jpeg' | 'none' | null;
	uiCrf: number | null;
	uiFrameRange: FrameRange | null;
}): Promise<RenderMediaOptions> => {
	// TODO: Lots of these options can have difference defaults
	// TODO: Scale option for example is not being applied
	const {
		proResProfile,
		concurrency,
		frameRange: defaultFrameRange,
		overwrite,
		inputProps,
		envVariables,
		quality,
		crf: defaultCrf,
		pixelFormat,
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
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
		configFileImageFormat,
	} = await getCliOptions({
		isLambda: false,
		type: 'series',
		remotionRoot,
	});

	const imageFormat = getImageFormat({
		codec,
		configFileImageFormat,
		uiImageFormat,
	});

	return {
		outputLocation,
		composition: {
			...config,
			width: width ?? config.width,
			height: height ?? config.height,
		},
		crf: uiCrf ?? defaultCrf,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		frameRange: uiFrameRange ?? defaultFrameRange,
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
	};
};
