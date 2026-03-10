import {RenderInternals} from '@remotion/renderer';
import type {RenderDefaults} from '@remotion/studio-shared';
import {ConfigInternals} from './config';

export const getConfiguredRenderDefaults = (): RenderDefaults => {
	const concurrency = RenderInternals.resolveConcurrency(
		ConfigInternals.getConcurrency(),
	);

	return {
		darkMode: ConfigInternals.getConfiguredDarkMode(),
		jpegQuality:
			ConfigInternals.getConfiguredJpegQuality() ??
			RenderInternals.DEFAULT_JPEG_QUALITY,
		scale: ConfigInternals.getConfiguredScale() ?? 1,
		logLevel: ConfigInternals.getConfiguredLogLevel(),
		codec: ConfigInternals.getOutputCodecOrUndefined() ?? 'h264',
		concurrency,
		maxConcurrency: RenderInternals.getMaxConcurrency(),
		minConcurrency: RenderInternals.getMinConcurrency(),
		stillImageFormat:
			ConfigInternals.getConfiguredStillImageFormat() ??
			RenderInternals.DEFAULT_STILL_IMAGE_FORMAT,
		videoImageFormat:
			ConfigInternals.getConfiguredVideoImageFormat() ??
			RenderInternals.DEFAULT_VIDEO_IMAGE_FORMAT,
		muted: ConfigInternals.getConfiguredMuted(),
		enforceAudioTrack: ConfigInternals.getConfiguredEnforceAudioTrack(),
		proResProfile: ConfigInternals.getConfiguredProResProfile() ?? null,
		x264Preset: ConfigInternals.getConfiguredX264Preset() ?? 'medium',
		pixelFormat: ConfigInternals.getConfiguredPixelFormat(),
		audioBitrate: ConfigInternals.getConfiguredAudioBitrate(),
		videoBitrate: ConfigInternals.getConfiguredVideoBitrate(),
		encodingBufferSize: ConfigInternals.getConfiguredEncodingBufferSize(),
		encodingMaxRate: ConfigInternals.getConfiguredEncodingMaxRate(),
		everyNthFrame: ConfigInternals.getConfiguredEveryNthFrame(),
		delayRenderTimeout: ConfigInternals.getConfiguredDelayRenderTimeout(),
		audioCodec: ConfigInternals.getConfiguredAudioCodec(),
		disableWebSecurity: ConfigInternals.getConfiguredDisableWebSecurity(),
		headless: ConfigInternals.getConfiguredHeadless(),
		ignoreCertificateErrors:
			ConfigInternals.getConfiguredIgnoreCertificateErrors(),
		openGlRenderer: ConfigInternals.getConfiguredOpenGlRenderer(),
		offthreadVideoCacheSizeInBytes:
			ConfigInternals.getConfiguredOffthreadVideoCacheSizeInBytes(),
		offthreadVideoThreads: ConfigInternals.getConfiguredOffthreadVideoThreads(),
		colorSpace: ConfigInternals.getConfiguredColorSpace() ?? 'default',
		multiProcessOnLinux: ConfigInternals.getConfiguredMultiProcessOnLinux(),
		userAgent: ConfigInternals.getConfiguredUserAgent(),
		repro: ConfigInternals.getConfiguredRepro(),
		numberOfGifLoops: ConfigInternals.getConfiguredNumberOfGifLoops(),
		beepOnFinish: ConfigInternals.getConfiguredBeepOnFinish(),
		forSeamlessAacConcatenation:
			ConfigInternals.getConfiguredForSeamlessAacConcatenation(),
		metadata: ConfigInternals.getMetadata(),
		hardwareAcceleration: ConfigInternals.getConfiguredHardwareAcceleration(),
		chromeMode: ConfigInternals.getConfiguredChromeMode() ?? 'headless-shell',
		mediaCacheSizeInBytes: ConfigInternals.getConfiguredMediaCacheSizeInBytes(),
		publicLicenseKey: ConfigInternals.getConfiguredPublicLicenseKey(),
		outputLocation: ConfigInternals.getOutputLocation(),
	};
};
