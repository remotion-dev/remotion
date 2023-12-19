import type {ApiHandler} from '../api-types';
import type {RemoveRenderRequest} from '../render-queue/job';
import {removeJob} from '../render-queue/queue';

export const handleRemoveRender: ApiHandler<RemoveRenderRequest, undefined> = ({
	input: {jobId},
}) => {
	removeJob(jobId);
	return Promise.resolve(undefined);
};
