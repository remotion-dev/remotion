import type {RenderModalState} from '../../editor/state/modals';
import type {RenderJob} from './job';

export const makeRetryPayload = (job: RenderJob): RenderModalState => {
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
			// TODO: take initial codec from config file
			initialCodec: 'h264',
		};
	}

	if (job.type === 'video') {
		// TODO: Implement correct retry mechanism for video
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
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};
