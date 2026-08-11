import {
	optimisticDeleteEffectKeyframe,
	optimisticDeleteEffectKeyframes,
	optimisticDeleteSequenceKeyframe,
	optimisticDeleteSequenceKeyframes,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetPropStatuses} from './save-sequence-prop';

export type DeleteSequenceKeyframeChange = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	sourceFrame: number;
	schema: InteractivitySchema;
	valueWhenLastKeyframeDeleted: unknown | null;
};

export type DeleteEffectKeyframeChange = DeleteSequenceKeyframeChange & {
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

export const callDeleteSequenceKeyframe = ({
	fileName,
	nodePath,
	fieldKey,
	sourceFrame,
	schema,
	setPropStatuses,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	sourceFrame: number;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			optimisticDeleteSequenceKeyframe({
				previous: prev,
				fieldKey,
				frame: sourceFrame,
			}),
		apiCall: () =>
			callApi('/api/delete-keyframes', {
				sequenceKeyframes: [
					{
						fileName,
						nodePath,
						key: fieldKey,
						frame: sourceFrame,
						schema,
					},
				],
				effectKeyframes: [],
				clientId,
			}),
		errorLabel: 'Could not delete keyframe',
	});
};

export const callDeleteEffectKeyframe = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	sourceFrame,
	schema,
	setPropStatuses,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	sourceFrame: number;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			optimisticDeleteEffectKeyframe({
				previous: prev,
				effectIndex,
				fieldKey,
				frame: sourceFrame,
			}),
		apiCall: () =>
			callApi('/api/delete-keyframes', {
				sequenceKeyframes: [],
				effectKeyframes: [
					{
						fileName,
						sequenceNodePath: nodePath,
						effectIndex,
						key: fieldKey,
						frame: sourceFrame,
						schema,
					},
				],
				clientId,
			}),
		errorLabel: 'Could not delete keyframe',
	});
};

export const callDeleteKeyframes = ({
	sequenceKeyframes,
	effectKeyframes,
	setPropStatuses,
	clientId,
}: {
	sequenceKeyframes: DeleteSequenceKeyframeChange[];
	effectKeyframes: DeleteEffectKeyframeChange[];
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
			optimisticDeleteSequenceKeyframes({
				previous: prev,
				keyframes: keyframes.map((keyframe) => ({
					fieldKey: keyframe.fieldKey,
					frame: keyframe.sourceFrame,
					valueWhenLastKeyframeDeleted: keyframe.valueWhenLastKeyframeDeleted,
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
			optimisticDeleteEffectKeyframes({
				previous: prev,
				keyframes: keyframes.map((keyframe) => ({
					effectIndex: keyframe.effectIndex,
					fieldKey: keyframe.fieldKey,
					frame: keyframe.sourceFrame,
					valueWhenLastKeyframeDeleted: keyframe.valueWhenLastKeyframeDeleted,
				})),
			}),
		);
	}

	return callApi('/api/delete-keyframes', {
		sequenceKeyframes: sequenceKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			nodePath: keyframe.nodePath,
			key: keyframe.fieldKey,
			frame: keyframe.sourceFrame,
			schema: keyframe.schema,
			valueWhenLastKeyframeDeleted: keyframe.valueWhenLastKeyframeDeleted,
		})),
		effectKeyframes: effectKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			sequenceNodePath: keyframe.nodePath,
			effectIndex: keyframe.effectIndex,
			key: keyframe.fieldKey,
			frame: keyframe.sourceFrame,
			schema: keyframe.schema,
			valueWhenLastKeyframeDeleted: keyframe.valueWhenLastKeyframeDeleted,
		})),
		clientId,
	}).then(() => undefined);
};
