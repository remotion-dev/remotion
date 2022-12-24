import type {ApiHandler} from '../api-types';
import {unsubscribeFromFileExistenceWatchers} from '../file-existence-watchers';
import type {UnsubscribeFromFileExistenceRequest} from '../render-queue/job';

export const unsubscribeFromFileExistence: ApiHandler<
	UnsubscribeFromFileExistenceRequest,
	undefined
> = ({input, remotionRoot}) => {
	unsubscribeFromFileExistenceWatchers({file: input.file, remotionRoot});
	return Promise.resolve(undefined);
};
