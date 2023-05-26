import type {
	AudioCodec,
	Codec,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import type {RenderModalState} from '../../editor/state/modals';
import {getDefaultCodecs} from './get-default-video-contexts';
import type {RenderJob} from './job';

export const makeRetryPayload = (job: RenderJob): RenderModalState => {
	const defaults = window.remotion_renderDefaults;
	if (!defaults) {
		throw new Error('defaults not set');
	}

	if (job.type === 'still') {
		const {initialAudioCodec, initialRenderType, initialVideoCodec} =
			getDefaultCodecs({
				defaultCodec: defaults.codec as Codec,
				isStill: true,
			});
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialFrame: job.frame,
			initialStillImageFormat: job.imageFormat,
			initialVideoImageFormat: defaults.videoImageFormat,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialVideoCodecForAudioTab: initialAudioCodec,
			initialRenderType,
			initialVideoCodecForVideoTab: initialVideoCodec,
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: defaults.muted,
			initialEnforceAudioTrack: defaults.enforceAudioTrack,
			initialProResProfile: defaults.proResProfile as ProResProfile,
			initialPixelFormat: defaults.pixelFormat as PixelFormat,
			initialAudioBitrate: defaults.audioBitrate,
			initialVideoBitrate: defaults.videoBitrate,
			initialEveryNthFrame: defaults.everyNthFrame,
			initialNumberOfGifLoops: defaults.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
			initialAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialHeadless: job.chromiumOptions.headless,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			defaultProps: job.inputProps,
			inFrameMark: null,
			outFrameMark: null,
		};
	}

	if (job.type === 'video') {
		const {initialAudioCodec, initialRenderType, initialVideoCodec} =
			getDefaultCodecs({
				defaultCodec: job.codec,
				isStill: false,
			});
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialStillImageFormat: defaults.stillImageFormat,
			initialVideoImageFormat: job.imageFormat,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialFrame: 0,
			initialConcurrency: job.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: job.muted,
			initialVideoCodecForAudioTab: initialAudioCodec,
			initialEnforceAudioTrack: job.enforceAudioTrack,
			initialRenderType,
			initialVideoCodecForVideoTab: initialVideoCodec,
			initialProResProfile:
				job.proResProfile ?? (defaults.proResProfile as ProResProfile),
			initialPixelFormat: job.pixelFormat,
			initialAudioBitrate: job.audioBitrate,
			initialVideoBitrate: job.videoBitrate,
			initialEveryNthFrame: job.everyNthFrame,
			initialNumberOfGifLoops: job.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
			initialAudioCodec: job.audioCodec,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialHeadless: job.chromiumOptions.headless,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			defaultProps: job.inputProps,
			inFrameMark: job.startFrame,
			outFrameMark: job.endFrame,
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};
