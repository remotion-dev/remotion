import type {Codec, PixelFormat, ProResProfile} from '@remotion/renderer';
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
			initialQuality: job.quality ?? defaults.quality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialAudioCodec,
			initialRenderType,
			initialVideoCodec,
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
			initialDelayRenderTimeout: defaults.delayRenderTimeout,
		};
	}

	if (job.type === 'video') {
		const {initialAudioCodec, initialRenderType, initialVideoCodec} =
			getDefaultCodecs({
				defaultCodec: defaults.codec as Codec,
				isStill: false,
			});
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialStillImageFormat: defaults.stillImageFormat,
			initialVideoImageFormat: job.imageFormat,
			initialQuality: job.quality ?? defaults.quality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialFrame: 0,
			initialConcurrency: job.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: job.muted,
			initialAudioCodec,
			initialEnforceAudioTrack: job.enforceAudioTrack,
			initialRenderType,
			initialVideoCodec,
			initialProResProfile:
				job.proResProfile ?? (defaults.proResProfile as ProResProfile),
			initialPixelFormat: job.pixelFormat,
			initialAudioBitrate: job.audioBitrate,
			initialVideoBitrate: job.videoBitrate,
			initialEveryNthFrame: job.everyNthFrame,
			initialNumberOfGifLoops: job.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};
