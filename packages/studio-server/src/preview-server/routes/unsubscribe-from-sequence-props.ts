import type {UnsubscribeFromSequencePropsRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {unsubscribeFromSequencePropsWatchers} from '../sequence-props-watchers';

export const unsubscribeFromSequenceProps: ApiHandler<
	UnsubscribeFromSequencePropsRequest,
	undefined
> = ({
	input: {
		fileName,
		nodePath,
		clientId,
		sequenceKeys,
		assetKeys = [],
		effectKeys,
	},
	remotionRoot,
}) => {
	unsubscribeFromSequencePropsWatchers({
		fileName,
		nodePath: nodePath.nodePath,
		remotionRoot,
		clientId,
		sequenceKeys,
		assetKeys,
		effectKeys,
	});
	return Promise.resolve(undefined);
};
