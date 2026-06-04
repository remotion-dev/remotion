import {
	optimisticUpdateEffectKeyframeSettings,
	optimisticUpdateSequenceKeyframeSettings,
	type KeyframeSettings,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

export const callUpdateSequenceKeyframeSettings = ({
	fileName,
	nodePath,
	fieldKey,
	settings,
	schema,
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	settings: KeyframeSettings;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
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
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	settings: KeyframeSettings;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticUpdateEffectKeyframeSettings({
				previous: prev,
				effectIndex,
				fieldKey,
				settings,
			}),
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
