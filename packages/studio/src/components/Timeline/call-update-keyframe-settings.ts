import {
	optimisticUpdateEffectKeyframeSettings,
	optimisticUpdateSequenceKeyframeSettings,
	type KeyframeSettings,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
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

type BatchSequenceKeyframeSettingsUpdate = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	settings: KeyframeSettings;
	schema: InteractivitySchema;
};

type BatchEffectKeyframeSettingsUpdate = BatchSequenceKeyframeSettingsUpdate & {
	effectIndex: number;
};

export const callBatchUpdateKeyframeSettings = ({
	sequenceKeyframes,
	effectKeyframes,
	setPropStatuses,
	clientId,
}: {
	sequenceKeyframes: BatchSequenceKeyframeSettingsUpdate[];
	effectKeyframes: BatchEffectKeyframeSettingsUpdate[];
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	for (const update of sequenceKeyframes) {
		setPropStatuses(update.nodePath, (prev) =>
			optimisticUpdateSequenceKeyframeSettings({
				previous: prev,
				fieldKey: update.fieldKey,
				settings: update.settings,
			}),
		);
	}

	for (const update of effectKeyframes) {
		setPropStatuses(update.nodePath, (prev) =>
			optimisticUpdateEffectKeyframeSettings({
				previous: prev,
				effectIndex: update.effectIndex,
				fieldKey: update.fieldKey,
				settings: update.settings,
			}),
		);
	}

	return callApi('/api/batch-update-keyframe-settings', {
		sequenceKeyframes: sequenceKeyframes.map((update) => ({
			fileName: update.fileName,
			nodePath: update.nodePath,
			key: update.fieldKey,
			settings: update.settings,
			schema: update.schema,
		})),
		effectKeyframes: effectKeyframes.map((update) => ({
			fileName: update.fileName,
			sequenceNodePath: update.nodePath,
			effectIndex: update.effectIndex,
			key: update.fieldKey,
			settings: update.settings,
			schema: update.schema,
		})),
		clientId,
	})
		.then(() => undefined)
		.catch((err) => {
			showNotification(
				`Could not update keyframe settings: ${
					err instanceof Error ? err.message : String(err)
				}`,
				4000,
			);
			throw err;
		});
};
