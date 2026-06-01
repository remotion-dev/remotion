import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteEffectKeyframeRequest,
	DeleteEffectKeyframeResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {deleteKeyframes} from './delete-keyframes';
import {withSavePropsLock} from './save-props-mutex';

export const deleteEffectKeyframeHandler: ApiHandler<
	DeleteEffectKeyframeRequest,
	DeleteEffectKeyframeResponse
> = ({input: {keyframes, clientId}, remotionRoot, logLevel}) =>
	withSavePropsLock(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-effect-keyframe] Received request to delete ${keyframes.length} keyframe(s)`,
		);

		const {effectResults} = await deleteKeyframes({
			sequenceKeyframes: [],
			effectKeyframes: keyframes,
			clientId,
			remotionRoot,
			logLevel,
		});

		return {results: effectResults};
	});
