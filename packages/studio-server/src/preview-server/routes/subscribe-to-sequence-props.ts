import type {
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {subscribeToSequencePropsWatchers} from '../sequence-props-watchers';

export const subscribeToSequenceProps: ApiHandler<
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse
> = ({
	input: {
		fileName,
		line,
		column,
		nodePath,
		componentIdentity,
		keys,
		effects,
		clientId,
	},
	remotionRoot,
	logLevel,
}) => {
	const result = subscribeToSequencePropsWatchers({
		fileName,
		line,
		column,
		nodePath,
		componentIdentity,
		keys,
		effects,
		remotionRoot,
		clientId,
		logLevel,
	});

	return Promise.resolve(result);
};
