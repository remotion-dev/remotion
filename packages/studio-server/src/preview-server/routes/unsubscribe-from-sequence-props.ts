import type {UnsubscribeFromSequencePropsRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {unsubscribeFromSequencePropsWatchers} from '../sequence-props-watchers';

export const unsubscribeFromSequenceProps: ApiHandler<
	UnsubscribeFromSequencePropsRequest,
	undefined
> = ({input: {fileName, nodePath, clientId}, remotionRoot}) => {
	unsubscribeFromSequencePropsWatchers({
		fileName,
		nodePath,
		remotionRoot,
		clientId,
	});
	return Promise.resolve(undefined);
};
