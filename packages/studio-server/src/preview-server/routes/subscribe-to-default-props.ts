import type {
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {subscribeToDefaultPropsWatchers} from '../default-props-watchers';

export const subscribeToDefaultProps: ApiHandler<
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse
> = ({input: {compositionId, clientId}, remotionRoot, entryPoint}) => {
	return subscribeToDefaultPropsWatchers({
		compositionId,
		clientId,
		remotionRoot,
		entryPoint,
	});
};
