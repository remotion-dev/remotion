import {
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {applyEffectResponseToPropStatuses} from './apply-effect-response-to-prop-statuses';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetPropStatuses} from './save-sequence-prop';

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
	schema: SequenceSchema;
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
	schema: SequenceSchema;
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
