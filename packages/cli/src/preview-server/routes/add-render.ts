import path from 'path';
import type {ApiHandler} from '../api-types';
import type {AddRenderRequest} from '../render-queue/job';
import {addJob} from '../render-queue/queue';

export const handleAddRender: ApiHandler<AddRenderRequest, undefined> = ({
	input,
	entryPoint,
	remotionRoot,
}): Promise<undefined> => {
	if (input.type !== 'still') {
		// TODO support composition rendering
		throw new Error('Only still images are supported for now');
	}

	addJob({
		job: {
			compositionId: input.compositionId,
			id: String(Math.random()).replace('0.', ''),
			startedAt: Date.now(),
			type: 'still',
			outputLocation: path.resolve(remotionRoot, input.outName),
			status: 'idle',
			imageFormat: input.imageFormat,
			quality: input.quality,
			frame: input.frame,
			scale: input.scale,
			cleanup: [],
			deletedOutputLocation: false,
			verbose: input.verbose,
		},
		entryPoint,
		remotionRoot,
	});

	return Promise.resolve(undefined);
};
