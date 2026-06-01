import {
	optimisticDeleteEffectKeyframe,
	optimisticDeleteSequenceKeyframe,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

export const callDeleteSequenceKeyframe = ({
	fileName,
	nodePath,
	fieldKey,
	sourceFrame,
	schema,
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	sourceFrame: number;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticDeleteSequenceKeyframe({
				previous: prev,
				fieldKey,
				frame: sourceFrame,
			}),
		apiCall: () =>
			callApi('/api/delete-sequence-keyframe', {
				fileName,
				nodePath,
				key: fieldKey,
				frame: sourceFrame,
				schema,
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
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	sourceFrame: number;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticDeleteEffectKeyframe({
				previous: prev,
				effectIndex,
				fieldKey,
				frame: sourceFrame,
			}),
		apiCall: () =>
			callApi('/api/delete-effect-keyframe', {
				fileName,
				sequenceNodePath: nodePath,
				effectIndex,
				key: fieldKey,
				frame: sourceFrame,
				schema,
				clientId,
			}),
		errorLabel: 'Could not delete keyframe',
	});
};
