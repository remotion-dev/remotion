import type {UnsubscribeFromFileExistenceRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {unsubscribeFromFileExistenceWatchers} from '../file-existence-watchers';

export const unsubscribeFromFileExistence: ApiHandler<
	UnsubscribeFromFileExistenceRequest,
	undefined
> = ({input, remotionRoot}) => {
	unsubscribeFromFileExistenceWatchers({
		file: input.file,
		clientId: input.clientId,
		remotionRoot,
	});
	return Promise.resolve(undefined);
};
