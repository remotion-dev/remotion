import type {ApiHandler} from '../api-types';
import {subscribeToFileExistenceWatchers} from '../file-existence-watchers';
import type {
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse,
} from '../render-queue/job';

export const subscribeToFileExistence: ApiHandler<
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse
> = ({input: {file}, remotionRoot}) => {
	// TODO: What if the user reloads the page? The file watcher doesn't get cleared
	const {exists} = subscribeToFileExistenceWatchers({
		file,
		remotionRoot,
	});

	return Promise.resolve({exists});
};
