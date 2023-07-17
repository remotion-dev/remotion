import type {ApiHandler} from '../api-types';
import type {
	CancelRenderRequest,
	CancelRenderResponse,
} from '../render-queue/job';
import {cancelJob} from '../render-queue/queue';

export const handleCancelRender: ApiHandler<
	CancelRenderRequest,
	CancelRenderResponse
> = ({input: {jobId}}) => {
	cancelJob(jobId);
	return Promise.resolve({});
};
