import type {
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {subscribeToSequencePropsWatchers} from '../sequence-props-watchers';

export const subscribeToSequenceProps: ApiHandler<
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse
> = ({input: {fileName, line, keys, clientId}, remotionRoot}) => {
	const result = subscribeToSequencePropsWatchers({
		fileName,
		line,
		keys,
		remotionRoot,
		clientId,
	});

	return Promise.resolve(result);
};
