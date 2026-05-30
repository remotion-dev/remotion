import {
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

export const callAddSequenceKeyframe = ({
	fileName,
	nodePath,
	fieldKey,
	sourceFrame,
	value,
	schema,
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	sourceFrame: number;
	value: unknown;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticAddSequenceKeyframe({
				previous: prev,
				fieldKey,
				frame: sourceFrame,
				value,
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

export const callAddEffectKeyframe = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	sourceFrame,
	value,
	schema,
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	sourceFrame: number;
	value: unknown;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticAddEffectKeyframe({
				previous: prev,
				effectIndex,
				fieldKey,
				frame: sourceFrame,
				value,
			}),
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
