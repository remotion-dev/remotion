import {
	optimisticMoveEffectKeyframes,
	optimisticMoveSequenceKeyframes,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import type {SetPropStatuses} from './save-sequence-prop';

export type MoveSequenceKeyframeChange = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	fromFrame: number;
	toFrame: number;
	schema: SequenceSchema;
};

export type MoveEffectKeyframeChange = MoveSequenceKeyframeChange & {
	effectIndex: number;
};

const groupByNodePath = <T extends {nodePath: SequencePropsSubscriptionKey}>(
	keyframes: T[],
): T[][] => {
	const groups = new Map<string, T[]>();
	for (const keyframe of keyframes) {
		const key = JSON.stringify(keyframe.nodePath);
		const group = groups.get(key) ?? [];
		group.push(keyframe);
		groups.set(key, group);
	}

	return [...groups.values()];
};

export const callMoveKeyframes = ({
	sequenceKeyframes,
	effectKeyframes,
	setPropStatuses,
	clientId,
}: {
	sequenceKeyframes: MoveSequenceKeyframeChange[];
	effectKeyframes: MoveEffectKeyframeChange[];
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	if (sequenceKeyframes.length === 0 && effectKeyframes.length === 0) {
		return Promise.resolve();
	}

	for (const keyframes of groupByNodePath(sequenceKeyframes)) {
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setPropStatuses(firstKeyframe.nodePath, (prev) =>
			optimisticMoveSequenceKeyframes({
				previous: prev,
				keyframes: keyframes.map((keyframe) => ({
					fieldKey: keyframe.fieldKey,
					fromFrame: keyframe.fromFrame,
					toFrame: keyframe.toFrame,
				})),
			}),
		);
	}

	for (const keyframes of groupByNodePath(effectKeyframes)) {
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setPropStatuses(firstKeyframe.nodePath, (prev) =>
			optimisticMoveEffectKeyframes({
				previous: prev,
				keyframes: keyframes.map((keyframe) => ({
					effectIndex: keyframe.effectIndex,
					fieldKey: keyframe.fieldKey,
					fromFrame: keyframe.fromFrame,
					toFrame: keyframe.toFrame,
				})),
			}),
		);
	}

	return callApi('/api/move-keyframes', {
		sequenceKeyframes: sequenceKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			nodePath: keyframe.nodePath,
			key: keyframe.fieldKey,
			fromFrame: keyframe.fromFrame,
			toFrame: keyframe.toFrame,
			schema: keyframe.schema,
		})),
		effectKeyframes: effectKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			sequenceNodePath: keyframe.nodePath,
			effectIndex: keyframe.effectIndex,
			key: keyframe.fieldKey,
			fromFrame: keyframe.fromFrame,
			toFrame: keyframe.toFrame,
			schema: keyframe.schema,
		})),
		clientId,
	}).then(() => undefined);
};
