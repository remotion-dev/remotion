import type {UnsubscribeFromDefaultPropsRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {unsubscribeFromDefaultPropsWatchers} from '../default-props-watchers';

export const unsubscribeFromDefaultProps: ApiHandler<
	UnsubscribeFromDefaultPropsRequest,
	undefined
> = ({input: {compositionId, clientId}}) => {
	unsubscribeFromDefaultPropsWatchers({
		compositionId,
		clientId,
	});
	return Promise.resolve(undefined);
};
