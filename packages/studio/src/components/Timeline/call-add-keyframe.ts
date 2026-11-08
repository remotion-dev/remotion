import {
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
	type AddEffectKeyframeRequest,
	type AddKeyframesRequest,
	type AddSequenceKeyframeRequest,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {
	createOptimisticEffectPropUpdate,
	attachOptimisticEffectPropHistory,
} from '../../helpers/optimistic-effect-props';
import {callApi} from '../call-api';
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

const addSequenceKeyframe = (request: AddSequenceKeyframeRequest) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/add-sequence-keyframe', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.addSequenceKeyframe(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

const addEffectKeyframe = (request: AddEffectKeyframeRequest) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/add-effect-keyframe', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.addEffectKeyframe(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

const addKeyframes = (request: AddKeyframesRequest) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/add-keyframes', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.addKeyframes(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

const groupByNodePath = <T extends {nodePath: SequencePropsSubscriptionKey}>(
	keyframes: T[],
): T[][] => {
	const groups = new Map<string, T[]>();
	for (const keyframe of keyframes) {
		const key = JSON.stringify([
			keyframe.nodePath,
			'effectIndex' in keyframe ? keyframe.effectIndex : null,
		]);
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
				videoConfigValues: nodePath.videoConfigValues,
				previous: prev,
				fieldKey,
				frame: sourceFrame,
				value,
				schema,
			}),
		apiCall: () =>
			addSequenceKeyframe({
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
						videoConfigValues: keyframe.nodePath.videoConfigValues,
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

	const effectUpdates: ReturnType<typeof createOptimisticEffectPropUpdate>[] =
		[];
	for (const keyframes of groupByNodePath(effectKeyframes)) {
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		const update = createOptimisticEffectPropUpdate({
			nodePath: firstKeyframe.nodePath,
			effectIndex: firstKeyframe.effectIndex,
			fieldKey: firstKeyframe.fieldKey,
			schema: firstKeyframe.schema,
			applyOptimistic: (prev) =>
				keyframes.reduce(
					(current, keyframe) =>
						optimisticAddEffectKeyframe({
							videoConfigValues: keyframe.nodePath.videoConfigValues,
							previous: current,
							effectIndex: keyframe.effectIndex,
							fieldKey: keyframe.fieldKey,
							frame: keyframe.sourceFrame,
							value: keyframe.value,
							schema: keyframe.schema,
						}),
					prev,
				),
		});
		setPropStatuses(firstKeyframe.nodePath, update.applyOptimistic);
		effectUpdates.push(update);
	}

	return addKeyframes(
		attachOptimisticEffectPropHistory(
			{
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
			},
			effectUpdates,
		),
	)
		.then(() => {
			for (const update of effectUpdates) update.acknowledge();
		})
		.catch((error) => {
			for (const update of effectUpdates) update.rollback();
			throw error;
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
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	const update = createOptimisticEffectPropUpdate({
		nodePath,
		effectIndex,
		fieldKey,
		schema,
		applyOptimistic: (prev) =>
			optimisticAddEffectKeyframe({
				videoConfigValues: nodePath.videoConfigValues,
				previous: prev,
				effectIndex,
				fieldKey,
				frame: sourceFrame,
				value,
				schema,
			}),
	});
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: update.applyOptimistic,
		applyServerResponse: (previous, response) =>
			update.optimistic ? previous : update.applyResponse(previous, response),
		apiCall: () =>
			addEffectKeyframe(
				attachOptimisticEffectPropHistory(
					{
						fileName,
						sequenceNodePath: nodePath,
						effectIndex,
						key: fieldKey,
						frame: sourceFrame,
						value: JSON.stringify(value),
						schema,
						clientId,
					},
					[update],
				),
			)
				.then((response) => {
					if (update.optimistic)
						setPropStatuses(nodePath, (previous) =>
							update.applyResponse(previous, response),
						);
					return response;
				})
				.catch((error) => {
					update.rollback();
					throw error;
				}),
		errorLabel: 'Could not add keyframe',
	});
};
