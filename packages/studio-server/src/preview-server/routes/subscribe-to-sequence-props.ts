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
		runtimeValues = {},
		runtimeIdentifierValues = {},
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
		runtimeValues,
		runtimeIdentifierValues,
		remotionRoot,
		clientId,
		logLevel,
	});

	return Promise.resolve(result);
};
