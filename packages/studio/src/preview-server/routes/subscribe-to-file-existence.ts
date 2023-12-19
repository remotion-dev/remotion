import type {ApiHandler} from '../api-types';
import {subscribeToFileExistenceWatchers} from '../file-existence-watchers';
import type {
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse,
} from '../render-queue/job';

export const subscribeToFileExistence: ApiHandler<
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse
> = ({input: {file, clientId}, remotionRoot}) => {
	const {exists} = subscribeToFileExistenceWatchers({
		file,
		remotionRoot,
		clientId,
	});

	return Promise.resolve({exists});
};
