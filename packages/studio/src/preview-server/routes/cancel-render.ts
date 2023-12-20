import type {ApiHandler} from '../api-types';
import type {CancelRenderRequest, CancelRenderResponse} from '../job';

export const handleCancelRender: ApiHandler<
	CancelRenderRequest,
	CancelRenderResponse
> = ({input: {jobId}, methods: {cancelJob}}) => {
	cancelJob(jobId);
	return Promise.resolve({});
};
