import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteSequenceKeyframeRequest,
	DeleteSequenceKeyframeResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {deleteKeyframes} from './delete-keyframes';
import {withSavePropsLock} from './save-props-mutex';

export const deleteSequenceKeyframeHandler: ApiHandler<
	DeleteSequenceKeyframeRequest,
	DeleteSequenceKeyframeResponse
> = ({input: {keyframes, clientId}, remotionRoot, logLevel}) =>
	withSavePropsLock(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-sequence-keyframe] Received request to delete ${keyframes.length} keyframe(s)`,
		);

		const {sequenceResults} = await deleteKeyframes({
			sequenceKeyframes: keyframes,
			effectKeyframes: [],
			clientId,
			remotionRoot,
			logLevel,
		});

		const [firstResult] = sequenceResults;
		if (!firstResult) {
			throw new Error('No sequence keyframes were specified for deletion');
		}

		return {
			canUpdate: true,
			props: firstResult.props,
			results: sequenceResults,
		};
	});
