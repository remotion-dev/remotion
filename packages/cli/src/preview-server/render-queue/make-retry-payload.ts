import type {RenderModalState} from '../../editor/state/modals';
import type {RenderJob} from './job';

export const makeRetryPayload = (job: RenderJob): RenderModalState => {
	if (job.type !== 'still') {
		throw new Error('Still is the only supported job type');
	}

	return {
		type: 'render',
		compositionId: job.compositionId,
		initialFrame: job.frame,
		initialImageFormat: job.imageFormat,
		initialQuality: job.quality,
		initialOutName: job.outName,
		initialScale: job.scale,
		initialVerbose: job.verbose,
	};
};
