import type {Codec, RenderMediaOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {getCliOptions} from './get-cli-options';

export const getRenderMediaOptions = async ({
	outputLocation,
	config,
	serveUrl,
	codec,
}: {
	outputLocation: RenderMediaOptions['outputLocation'];
	config: RenderMediaOptions['composition'];
	serveUrl: string;
	codec: Codec;
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
		imageFormat,
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
	} = await getCliOptions({
		isLambda: false,
		type: 'series',
		codec,
	});

	return {
		outputLocation,
		composition: config,
		crf,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
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
	};
};
