import type {UnsubscribeFromSequencePropsBatchRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {unsubscribeFromSequencePropsWatchers} from '../sequence-props-watchers';

export const unsubscribeFromSequenceProps: ApiHandler<
	UnsubscribeFromSequencePropsBatchRequest,
	undefined
> = ({input, remotionRoot}) => {
	for (const {
		fileName,
		nodePath,
		clientId,
		sequenceKeys,
		assetKeys = [],
		effectKeys,
	} of input.requests) {
		unsubscribeFromSequencePropsWatchers({
			fileName,
			nodePath: nodePath.nodePath,
			remotionRoot,
			clientId,
			sequenceKeys,
			assetKeys,
			effectKeys,
		});
	}

	return Promise.resolve(undefined);
};
