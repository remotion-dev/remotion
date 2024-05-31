import type {RemoveRenderRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

export const handleRemoveRender: ApiHandler<RemoveRenderRequest, undefined> = ({
	input: {jobId},
	methods: {removeJob},
}) => {
	removeJob(jobId);
	return Promise.resolve(undefined);
};
