import type {Codec} from '@remotion/renderer';
import type {RenderModalState} from '../../editor/state/modals';
import type {RenderJob} from './job';

export const makeRetryPayload = (job: RenderJob): RenderModalState => {
	const defaults = window.remotion_renderDefaults;
	if (!defaults) {
		throw new Error('defaults not set');
	}

	if (job.type === 'still') {
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialFrame: job.frame,
			initialImageFormat: job.imageFormat,
			initialQuality: job.quality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialRenderType: 'still',
			initialCodec: defaults.codec as Codec,
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
		};
	}

	if (job.type === 'video') {
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialImageFormat: job.imageFormat,
			initialQuality: job.quality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialFrame: 0,
			initialRenderType: 'video',
			initialCodec: job.codec,
			initialConcurrency: job.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};
