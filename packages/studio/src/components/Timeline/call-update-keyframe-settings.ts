import {
	optimisticUpdateEffectKeyframeSettings,
	optimisticUpdateSequenceKeyframeSettings,
	type KeyframeSettings,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {callApi} from '../call-api';
import {applyEffectResponseToPropStatuses} from './apply-effect-response-to-prop-statuses';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetPropStatuses} from './save-sequence-prop';

export const callUpdateSequenceKeyframeSettings = ({
	fileName,
	nodePath,
	fieldKey,
	settings,
	schema,
	setPropStatuses,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	settings: KeyframeSettings;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			optimisticUpdateSequenceKeyframeSettings({
				previous: prev,
				fieldKey,
				settings,
			}),
		apiCall: () =>
			callApi('/api/update-sequence-keyframe-settings', {
				fileName,
				nodePath,
				key: fieldKey,
				settings,
				schema,
				clientId,
			}),
		errorLabel: 'Could not update keyframe settings',
	});
};

export const callUpdateEffectKeyframeSettings = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	settings,
	schema,
	setPropStatuses,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	settings: KeyframeSettings;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			optimisticUpdateEffectKeyframeSettings({
				previous: prev,
				effectIndex,
				fieldKey,
				settings,
			}),
		applyServerResponse: (prev, response) =>
			applyEffectResponseToPropStatuses({previous: prev, response}),
		apiCall: () =>
			callApi('/api/update-effect-keyframe-settings', {
				fileName,
				sequenceNodePath: nodePath,
				effectIndex,
				key: fieldKey,
				settings,
				schema,
				clientId,
			}),
		errorLabel: 'Could not update keyframe settings',
	});
};
