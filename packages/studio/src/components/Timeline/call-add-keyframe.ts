import {
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {callApi} from '../call-api';
import {applyEffectResponseToPropStatuses} from './apply-effect-response-to-prop-statuses';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetPropStatuses} from './save-sequence-prop';

export type AddSequenceKeyframeChange = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	sourceFrame: number;
	value: unknown;
	schema: InteractivitySchema;
};

export type AddEffectKeyframeChange = AddSequenceKeyframeChange & {
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

export const callAddSequenceKeyframe = ({
	fileName,
	nodePath,
	fieldKey,
	sourceFrame,
	value,
	schema,
	setPropStatuses,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	sourceFrame: number;
	value: unknown;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			optimisticAddSequenceKeyframe({
				previous: prev,
				fieldKey,
				frame: sourceFrame,
				value,
				schema,
			}),
		apiCall: () =>
			callApi('/api/add-sequence-keyframe', {
				fileName,
				nodePath,
				key: fieldKey,
				frame: sourceFrame,
				value: JSON.stringify(value),
				schema,
				clientId,
			}),
		errorLabel: 'Could not add keyframe',
	});
};

export const callAddKeyframes = ({
	sequenceKeyframes,
	effectKeyframes,
	setPropStatuses,
	clientId,
}: {
	sequenceKeyframes: AddSequenceKeyframeChange[];
	effectKeyframes: AddEffectKeyframeChange[];
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
			keyframes.reduce(
				(current, keyframe) =>
					optimisticAddSequenceKeyframe({
						previous: current,
						fieldKey: keyframe.fieldKey,
						frame: keyframe.sourceFrame,
						value: keyframe.value,
						schema: keyframe.schema,
					}),
				prev,
			),
		);
	}

	for (const keyframes of groupByNodePath(effectKeyframes)) {
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setPropStatuses(firstKeyframe.nodePath, (prev) =>
			keyframes.reduce(
				(current, keyframe) =>
					optimisticAddEffectKeyframe({
						previous: current,
						effectIndex: keyframe.effectIndex,
						fieldKey: keyframe.fieldKey,
						frame: keyframe.sourceFrame,
						value: keyframe.value,
						schema: keyframe.schema,
					}),
				prev,
			),
		);
	}

	return callApi('/api/add-keyframes', {
		sequenceKeyframes: sequenceKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			nodePath: keyframe.nodePath,
			key: keyframe.fieldKey,
			frame: keyframe.sourceFrame,
			value: JSON.stringify(keyframe.value),
			schema: keyframe.schema,
		})),
		effectKeyframes: effectKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			sequenceNodePath: keyframe.nodePath,
			effectIndex: keyframe.effectIndex,
			key: keyframe.fieldKey,
			frame: keyframe.sourceFrame,
			value: JSON.stringify(keyframe.value),
			schema: keyframe.schema,
		})),
		clientId,
	}).then(() => undefined);
};

export const callAddEffectKeyframe = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	sourceFrame,
	value,
	schema,
	setPropStatuses,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	sourceFrame: number;
	value: unknown;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			optimisticAddEffectKeyframe({
				previous: prev,
				effectIndex,
				fieldKey,
				frame: sourceFrame,
				value,
				schema,
			}),
		applyServerResponse: (prev, response) =>
			applyEffectResponseToPropStatuses({previous: prev, response}),
		apiCall: () =>
			callApi('/api/add-effect-keyframe', {
				fileName,
				sequenceNodePath: nodePath,
				effectIndex,
				key: fieldKey,
				frame: sourceFrame,
				value: JSON.stringify(value),
				schema,
				clientId,
			}),
		errorLabel: 'Could not add keyframe',
	});
};
