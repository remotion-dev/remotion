import {
	optimisticUpdateEffectKeyframeSettings,
	optimisticUpdateSequenceKeyframeSettings,
	type BatchUpdateKeyframeSettingsRequest,
	type KeyframeSettings,
	type UpdateEffectKeyframeSettingsRequest,
	type UpdateSequenceKeyframeSettingsRequest,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {applyEffectResponseToPropStatuses} from './apply-effect-response-to-prop-statuses';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetPropStatuses} from './save-sequence-prop';

const updateSequenceKeyframeSettings = (
	request: UpdateSequenceKeyframeSettingsRequest,
) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/update-sequence-keyframe-settings', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.updateSequenceKeyframeSettings(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

const updateEffectKeyframeSettings = (
	request: UpdateEffectKeyframeSettingsRequest,
) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/update-effect-keyframe-settings', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.updateEffectKeyframeSettings(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

const batchUpdateKeyframeSettings = (
	request: BatchUpdateKeyframeSettingsRequest,
) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/batch-update-keyframe-settings', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.batchUpdateKeyframeSettings(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

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
			updateSequenceKeyframeSettings({
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
			updateEffectKeyframeSettings({
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

	return batchUpdateKeyframeSettings({
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
