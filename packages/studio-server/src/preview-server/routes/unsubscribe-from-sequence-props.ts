import type {UnsubscribeFromSequencePropsRequest} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {unsubscribeFromSequencePropsWatchers} from '../sequence-props-watchers';

export const unsubscribeFromSequenceProps: ApiHandler<
	UnsubscribeFromSequencePropsRequest,
	undefined
> = ({
	input: {fileName, nodePath, clientId, sequenceKeys, effectKeys},
	remotionRoot,
}) => {
	unsubscribeFromSequencePropsWatchers({
		fileName,
		nodePath: nodePath.nodePath,
		remotionRoot,
		clientId,
		sequenceKeys,
		effectKeys,
		videoConfigValues: nodePath.videoConfigValues,
	});
	return Promise.resolve(undefined);
};
