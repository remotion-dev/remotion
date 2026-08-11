import type {
	CancelRenderRequest,
	CancelRenderResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

export const handleCancelRender: ApiHandler<
	CancelRenderRequest,
	CancelRenderResponse
> = ({input: {jobId}, methods: {cancelJob}}) => {
	cancelJob(jobId);
	return Promise.resolve({});
};
