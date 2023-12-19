import type {ApiHandler} from '../api-types';
import type {RemoveRenderRequest} from '../job';

export const handleRemoveRender: ApiHandler<RemoveRenderRequest, undefined> = ({
	input: {jobId},
	methods: {removeJob},
}) => {
	removeJob(jobId);
	return Promise.resolve(undefined);
};
