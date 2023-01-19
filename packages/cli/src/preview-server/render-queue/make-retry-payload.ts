import type {Codec} from '@remotion/renderer';
import type {RenderModalState} from '../../editor/state/modals';
import {getDefaultCodecs} from './get-default-video-contexts';
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
			initialStillImageFormat: job.imageFormat,
			// TODO: Take from config
			initialVideoImageFormat: 'jpeg',
			initialQuality: job.quality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			...getDefaultCodecs({
				defaultCodec: defaults.codec as Codec,
				isStill: true,
			}),
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
		};
	}

	if (job.type === 'video') {
		return {
			type: 'render',
			compositionId: job.compositionId,
			// TODO: Take from config
			initialStillImageFormat: 'png',
			initialVideoImageFormat: job.imageFormat,
			initialQuality: job.quality,
			initialOutName: job.outName,
			initialScale: job.scale,
			initialVerbose: job.verbose,
			initialFrame: 0,
			...getDefaultCodecs({
				defaultCodec: defaults.codec as Codec,
				isStill: false,
			}),
			initialConcurrency: job.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};
