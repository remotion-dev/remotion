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
		videoConfigValues,
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
		videoConfigValues,
		logLevel,
	});

	return Promise.resolve(result);
};
