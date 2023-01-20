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
	uiScale,
	uiMuted,
	uiQuality,
}: {
	outputLocation: RenderMediaOptions['outputLocation'];
	config: RenderMediaOptions['composition'];
	serveUrl: string;
	codec: Codec;
	remotionRoot: string;
	uiImageFormat: 'png' | 'jpeg' | 'none' | null;
	uiCrf: number | null;
	uiFrameRange: FrameRange | null;
	uiScale: number | null;
	uiMuted: boolean | null;
	uiQuality: number | null;
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
		crf: configFileCrf,
		pixelFormat,
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		scale: configFileScale,
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

	return {
		outputLocation,
		composition: {
			...config,
			width: width ?? config.width,
			height: height ?? config.height,
		},
		crf: uiCrf ?? configFileCrf,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		frameRange: uiFrameRange ?? defaultFrameRange,
		imageFormat: getImageFormat({
			codec,
			configFileImageFormat,
			uiImageFormat,
		}),
		// TODO: Take from UI
		inputProps,
		overwrite,
		// TODO: Take from UI
		pixelFormat,
		// TODO: Take from UI
		proResProfile,
		// TODO: Take from UI
		quality,
		dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		chromiumOptions,
		timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
		scale: uiScale ?? configFileScale,
		port,
		numberOfGifLoops,
		everyNthFrame,
		verbose: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		muted: uiMuted ?? muted,
		// TODO: Take from UI
		enforceAudioTrack,
		browserExecutable,
		ffmpegOverride,
		// TODO: Take from UI
		concurrency,
		serveUrl,
		// TODO: Take from UI
		codec,
		audioBitrate,
		videoBitrate,
	};
};
