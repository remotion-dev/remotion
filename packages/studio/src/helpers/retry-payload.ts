import type {
	AudioCodec,
	Codec,
	ColorSpace,
	PixelFormat,
	X264Preset,
} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import type {RenderJob} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import type {ClientRenderJob} from '../components/RenderQueue/client-side-render-types';
import type {RenderModalState, WebRenderModalState} from '../state/modals';

export const makeRetryPayload = (job: RenderJob): RenderModalState => {
	const defaults = window.remotion_renderDefaults;
	if (!defaults) {
		throw new Error('defaults not set');
	}

	if (job.type === 'still') {
		return {
			type: 'server-render',
			compositionId: job.compositionId,
			initialFrame: job.frame,
			initialStillImageFormat: job.imageFormat,
			initialVideoImageFormat: null,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialScale: job.scale,
			initialLogLevel: job.logLevel,
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: defaults.muted,
			initialEnforceAudioTrack: defaults.enforceAudioTrack,
			initialProResProfile: null,
			initialx264Preset: defaults.x264Preset as X264Preset,
			initialPixelFormat: defaults.pixelFormat as PixelFormat,
			initialAudioBitrate: defaults.audioBitrate,
			initialVideoBitrate: defaults.videoBitrate,
			initialEveryNthFrame: defaults.everyNthFrame,
			initialNumberOfGifLoops: defaults.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
			defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialHeadless: job.chromiumOptions.headless,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			initialDarkMode: job.chromiumOptions.darkMode,
			defaultProps: NoReactInternals.deserializeJSONWithSpecialTypes(
				job.serializedInputPropsWithCustomSchema,
			),
			inFrameMark: null,
			outFrameMark: null,
			initialOffthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
			initialOffthreadVideoThreads: job.offthreadVideoThreads,
			initialColorSpace: defaults.colorSpace as ColorSpace,
			initialMultiProcessOnLinux: job.multiProcessOnLinux,
			defaultConfigurationVideoCodec: defaults.codec as Codec,
			initialEncodingBufferSize: defaults.encodingBufferSize,
			initialEncodingMaxRate: defaults.encodingMaxRate,
			initialUserAgent: job.chromiumOptions.userAgent,
			initialBeep: job.beepOnFinish,
			initialRepro: job.repro,
			initialForSeamlessAacConcatenation: defaults.forSeamlessAacConcatenation,
			defaulMetadata: job.metadata,
			renderTypeOfLastRender: 'still',
			initialHardwareAcceleration: defaults.hardwareAcceleration,
			initialChromeMode: job.chromeMode,
			initialMediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
			renderDefaults: defaults,
		};
	}

	if (job.type === 'sequence') {
		return {
			type: 'server-render',
			initialFrame: 0,
			compositionId: job.compositionId,
			initialVideoImageFormat: null,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialScale: job.scale,
			initialLogLevel: job.logLevel,
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: defaults.muted,
			initialEnforceAudioTrack: defaults.enforceAudioTrack,
			initialProResProfile: null,
			initialx264Preset: defaults.x264Preset as X264Preset,
			initialPixelFormat: defaults.pixelFormat as PixelFormat,
			initialAudioBitrate: defaults.audioBitrate,
			initialVideoBitrate: defaults.videoBitrate,
			initialEveryNthFrame: defaults.everyNthFrame,
			initialNumberOfGifLoops: defaults.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialHeadless: job.chromiumOptions.headless,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			initialDarkMode: job.chromiumOptions.darkMode,
			defaultProps: NoReactInternals.deserializeJSONWithSpecialTypes(
				job.serializedInputPropsWithCustomSchema,
			),
			initialStillImageFormat: defaults.stillImageFormat,
			inFrameMark: job.startFrame,
			outFrameMark: job.endFrame,
			initialOffthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
			initialOffthreadVideoThreads: job.offthreadVideoThreads,
			initialColorSpace: defaults.colorSpace as ColorSpace,
			initialMultiProcessOnLinux: job.multiProcessOnLinux,
			defaultConfigurationVideoCodec: defaults.codec as Codec,
			defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEncodingBufferSize: defaults.encodingBufferSize,
			initialEncodingMaxRate: defaults.encodingMaxRate,
			initialUserAgent: job.chromiumOptions.userAgent,
			initialBeep: job.beepOnFinish,
			initialRepro: job.repro,
			initialForSeamlessAacConcatenation: defaults.forSeamlessAacConcatenation,
			defaulMetadata: job.metadata,
			renderTypeOfLastRender: 'sequence',
			initialHardwareAcceleration: defaults.hardwareAcceleration,
			initialChromeMode: job.chromeMode,
			initialMediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
			renderDefaults: defaults,
		};
	}

	if (job.type === 'video') {
		return {
			type: 'server-render',
			compositionId: job.compositionId,
			initialStillImageFormat: defaults.stillImageFormat,
			initialVideoImageFormat: job.imageFormat,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialScale: job.scale,
			initialLogLevel: job.logLevel,
			initialFrame: 0,
			initialConcurrency: job.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: job.muted,
			initialEnforceAudioTrack: job.enforceAudioTrack,
			initialProResProfile: job.proResProfile ?? null,
			initialx264Preset: job.x264Preset ?? (defaults.x264Preset as X264Preset),
			initialPixelFormat: job.pixelFormat,
			initialAudioBitrate: job.audioBitrate,
			initialVideoBitrate: job.videoBitrate,
			initialEveryNthFrame: job.everyNthFrame,
			initialNumberOfGifLoops: job.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialHeadless: job.chromiumOptions.headless,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			initialDarkMode: job.chromiumOptions.darkMode,
			defaultProps: NoReactInternals.deserializeJSONWithSpecialTypes(
				job.serializedInputPropsWithCustomSchema,
			),
			inFrameMark: job.startFrame,
			outFrameMark: job.endFrame,
			initialOffthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
			initialOffthreadVideoThreads: job.offthreadVideoThreads,
			initialColorSpace: job.colorSpace,
			initialMultiProcessOnLinux: job.multiProcessOnLinux,
			defaultConfigurationVideoCodec: job.codec,
			defaultConfigurationAudioCodec: job.audioCodec,
			initialEncodingBufferSize: job.encodingBufferSize,
			initialEncodingMaxRate: job.encodingMaxRate,
			initialUserAgent: job.chromiumOptions.userAgent,
			initialBeep: job.beepOnFinish,
			initialRepro: job.repro,
			initialForSeamlessAacConcatenation: job.forSeamlessAacConcatenation,
			defaulMetadata: job.metadata,
			renderTypeOfLastRender: 'video',
			initialHardwareAcceleration: job.hardwareAcceleration,
			initialChromeMode: job.chromeMode,
			initialMediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
			renderDefaults: defaults,
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};

export const makeClientRetryPayload = (
	job: ClientRenderJob,
): WebRenderModalState => {
	return {
		type: 'web-render',
		compositionId: job.compositionId,
		initialFrame: job.type === 'client-still' ? job.frame : 0,
		initialLogLevel: job.logLevel,
		initialLicenseKey: job.licenseKey,
		defaultProps: job.inputProps,
		inFrameMark: job.type === 'client-video' ? job.startFrame : null,
		outFrameMark: job.type === 'client-video' ? job.endFrame : null,
		initialDefaultOutName: job.outName,
		initialScale: job.scale,
		initialDelayRenderTimeout: job.delayRenderTimeout,
		initialMediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
		initialAudioBitrate: job.type === 'client-video' ? job.audioBitrate : null,
		initialAudioCodec: job.type === 'client-video' ? job.audioCodec : null,
		initialContainer: job.type === 'client-video' ? job.container : null,
		initialHardwareAcceleration:
			job.type === 'client-video'
				? (job.hardwareAcceleration as HardwareAccelerationOption)
				: null,
		initialVideoBitrate: job.type === 'client-video' ? job.videoBitrate : null,
		initialVideoCodec: job.type === 'client-video' ? job.videoCodec : null,
		initialStillImageFormat:
			job.type === 'client-still' ? job.imageFormat : 'png',
		initialKeyframeIntervalInSeconds:
			job.type === 'client-video' ? job.keyframeIntervalInSeconds : null,
		initialMuted: job.type === 'client-video' ? job.muted : null,
		initialTransparent: job.type === 'client-video' ? job.transparent : null,
	};
};
