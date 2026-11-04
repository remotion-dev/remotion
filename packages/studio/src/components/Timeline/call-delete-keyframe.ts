import {
	optimisticDeleteEffectKeyframes,
	optimisticDeleteSequenceKeyframes,
	type DeleteKeyframesRequest,
} from '@remotion/studio-shared';
import type {ContextType} from 'react';
import {useCallback, useContext} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {assertEffectChainEditable} from '../../helpers/effect-deletion-state';
import {callApi} from '../call-api';
import {createCanvasDragPreview} from '../canvas-drag-preview';
import {showNotification} from '../Notifications/NotificationCenter';

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

const deleteKeyframes = (request: DeleteKeyframesRequest) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/delete-keyframes', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.deleteKeyframes(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

type DeleteKeyframesAction = {
	sequenceKeyframes: DeleteSequenceKeyframeChange[];
	effectKeyframes: DeleteEffectKeyframeChange[];
	clientId: string;
};

type DeletionSetters = Pick<
	ContextType<typeof Internals.VisualModeSettersContext>,
	| 'setPropStatuses'
	| 'setPropStatusesBatch'
	| 'updateDragOverrides'
	| 'updateDragOverridesBatch'
	| 'updateEffectDragOverridesBatch'
>;

const isEffectChange = (
	change: DeleteSequenceKeyframeChange | DeleteEffectKeyframeChange,
): change is DeleteEffectKeyframeChange => 'effectIndex' in change;

export const callDeleteKeyframes = ({
	sequenceKeyframes,
	effectKeyframes,
	clientId,
	setters,
	getSnapshot,
}: DeleteKeyframesAction & {
	setters: DeletionSetters;
	getSnapshot: ContextType<
		typeof Internals.VisualModePropStatusesSubscriptionContext
	>['getSnapshot'];
}): Promise<void> => {
	try {
		for (const nodePath of effectKeyframes.map((change) => change.nodePath))
			assertEffectChainEditable(nodePath);
	} catch (error) {
		return Promise.reject(error);
	}

	if (sequenceKeyframes.length === 0 && effectKeyframes.length === 0)
		return Promise.resolve();
	const preview = createCanvasDragPreview({
		updateDragOverrides: setters.updateDragOverrides,
		setPropStatuses: setters.setPropStatuses,
		setPropStatusesBatch: setters.setPropStatusesBatch,
		getPropStatuses: (nodePath) =>
			getSnapshot(Internals.makeSequencePropsSubscriptionKey(nodePath)) ??
			undefined,
	});
	const updates: Parameters<typeof setters.setPropStatusesBatch>[0][number][] =
		[];
	const sequenceOverrides: Parameters<
		typeof preview.setDragOverridesBatch
	>[0][number][] = [];
	const effectOverrides: Parameters<
		typeof preview.setEffectDragOverridesBatch
	>[0][number][] = [];
	const groups = new Map<
		string,
		{
			nodePath: SequencePropsSubscriptionKey;
			sequence: DeleteSequenceKeyframeChange[];
			effects: DeleteEffectKeyframeChange[];
		}
	>();
	for (const change of [...sequenceKeyframes, ...effectKeyframes]) {
		const key = Internals.makeSequencePropsSubscriptionKey(change.nodePath);
		let group = groups.get(key);
		if (!group) {
			group = {nodePath: change.nodePath, sequence: [], effects: []};
			groups.set(key, group);
		}

		if (isEffectChange(change)) group.effects.push(change);
		else group.sequence.push(change);
	}

	for (const [nodeKey, group] of groups) {
		const previous = getSnapshot(nodeKey);
		if (!previous?.canUpdate) continue;
		const update: Parameters<typeof setters.setPropStatuses>[1] = (status) =>
			optimisticDeleteEffectKeyframes({
				previous: optimisticDeleteSequenceKeyframes({
					previous: status,
					videoConfigValues: group.nodePath.videoConfigValues,
					keyframes: group.sequence.map((change) => ({
						fieldKey: change.fieldKey,
						frame: change.sourceFrame,
						valueWhenLastKeyframeDeleted: change.valueWhenLastKeyframeDeleted,
					})),
				}),
				videoConfigValues: group.nodePath.videoConfigValues,
				keyframes: group.effects.map((change) => ({
					effectIndex: change.effectIndex,
					fieldKey: change.fieldKey,
					frame: change.sourceFrame,
					valueWhenLastKeyframeDeleted: change.valueWhenLastKeyframeDeleted,
				})),
			});
		const next = update(previous);
		if (!next.canUpdate) continue;
		const fields = new Map<string, {key: string; effectIndex: number | null}>();
		for (const change of [...group.sequence, ...group.effects]) {
			const effectIndex = isEffectChange(change) ? change.effectIndex : null;
			fields.set(JSON.stringify([effectIndex, change.fieldKey]), {
				key: change.fieldKey,
				effectIndex,
			});
		}

		for (const {key, effectIndex} of fields.values()) {
			const effect =
				effectIndex === null
					? null
					: next.effects.find((item) => item.effectIndex === effectIndex);
			const source =
				effectIndex === null
					? next.props[key]
					: effect?.canUpdate
						? effect.props[key]
						: null;
			if (!source) continue;
			const status = Internals.evaluateSourcePropStatuses(
				{value: source},
				group.nodePath.videoConfigValues,
			).value;
			const value =
				status.status === 'keyframed'
					? {type: 'keyframed' as const, status}
					: status.status === 'static'
						? Internals.makeStaticDragOverride(status.codeValue)
						: null;
			if (value === null) continue;
			if (effectIndex === null)
				sequenceOverrides.push({nodePath: group.nodePath, key, value});
			else
				effectOverrides.push({
					nodePath: group.nodePath,
					effectIndex,
					key,
					value,
				});
		}

		updates.push({nodePath: group.nodePath, update});
	}

	unstable_batchedUpdates(() => {
		preview.setDragOverridesBatch(
			sequenceOverrides,
			setters.updateDragOverridesBatch,
		);
		preview.setEffectDragOverridesBatch(
			effectOverrides,
			setters.updateEffectDragOverridesBatch,
		);
		preview.setPropStatusesBatch(updates);
	});
	return deleteKeyframes({
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
	})
		.then((response) => preview.acknowledgeKeyframes(response.results))
		.catch((error) => {
			preview.fail();
			throw error;
		});
};

export const useDeleteKeyframes = ({
	notifyOnError,
}: {
	notifyOnError: boolean;
}) => {
	const setters = useContext(Internals.VisualModeSettersContext);
	const {getSnapshot} = useContext(
		Internals.VisualModePropStatusesSubscriptionContext,
	);
	return useCallback(
		(action: DeleteKeyframesAction) =>
			callDeleteKeyframes({...action, setters, getSnapshot}).catch((error) => {
				if (notifyOnError)
					showNotification(
						`Could not delete keyframe: ${error instanceof Error ? error.message : String(error)}`,
						4000,
					);
				throw error;
			}),
		[getSnapshot, notifyOnError, setters],
	);
};
