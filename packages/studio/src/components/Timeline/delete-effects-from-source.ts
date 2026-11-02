import {useCallback} from 'react';
import type {EffectDefinition, SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import {
	getPendingEffectDeletions,
	getEffectDeletionSelectionRevision,
	isEffectDeletionPending,
} from '../../helpers/effect-deletion-state';
import {authorizeEffectDeletionRequest} from '../../helpers/guard-pending-effect-deletion';
import {getSequencePropsSourceSession} from '../../helpers/sequence-props-source-version';
import {deleteEffects} from '../effect-operations-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	getTimelineSelectionKey,
	useCurrentTimelineSelectionStateAsRef,
	type TimelineSelection,
} from './TimelineSelection';

export {getPendingEffectDeletions, isEffectDeletionPending};
export type EffectDeletionTarget = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndices: readonly number[];
	readonly effects: readonly EffectDefinition<unknown>[];
};
export type EffectDeletionResult =
	| {status: 'success'}
	| {status: 'already-pending'}
	| {status: 'error'; reason: string};

export const deleteEffectsFromSource = async (
	targets: readonly EffectDeletionTarget[],
	currentSelection: ReturnType<
		typeof useCurrentTimelineSelectionStateAsRef
	> | null,
): Promise<EffectDeletionResult> => {
	if (
		!canUseEffectOperations() ||
		(currentSelection !== null && !currentSelection.current.canSelect)
	)
		return {status: 'error', reason: 'Effect editing is unavailable'};
	if (targets.some(({nodePath}) => isEffectDeletionPending(nodePath)))
		return {status: 'already-pending'};
	const grouped = new Map<string, EffectDeletionTarget>();
	for (const target of targets) {
		if (
			target.effectIndices.some(
				(index) =>
					!Number.isInteger(index) ||
					index < 0 ||
					index >= target.effects.length,
			)
		)
			return {
				status: 'error',
				reason: 'The effect could not be found. Try the edit again.',
			};
		const key = JSON.stringify([
			target.nodePath.absolutePath,
			target.nodePath.nodePath,
		]);
		const existing = grouped.get(key);
		grouped.set(key, {
			...target,
			effectIndices: [
				...new Set([
					...(existing?.effectIndices ?? []),
					...target.effectIndices,
				]),
			],
		});
	}

	if (grouped.size === 0)
		return {status: 'error', reason: 'No effects were selected'};
	const entries = Internals.OptimisticEffectDeletion.batch(() =>
		[...grouped.values()].map(({nodePath, effectIndices, effects}) =>
			Internals.OptimisticEffectDeletion.begin({
				nodePath,
				effectIndices,
				definitions: effects,
			}),
		),
	);
	if (entries.some((entry) => entry === null)) {
		Internals.OptimisticEffectDeletion.batch(() => {
			for (const entry of entries)
				if (entry) Internals.OptimisticEffectDeletion.remove(entry);
		});
		return {status: 'already-pending'};
	}

	const entriesByOriginalPath = new Map(
		[...grouped.keys()].map((key, index) => [key, entries[index]]),
	);
	const previousSelection = currentSelection?.current.selectedItems ?? [];
	const fallback = new Map<string, TimelineSelection>();
	let changedSelection = false;
	for (const item of previousSelection) {
		const info = 'nodePathInfo' in item ? item.nodePathInfo : null;
		const pending = info
			? Internals.OptimisticEffectDeletion.get(info.sequenceSubscriptionKey)
			: null;
		const next: TimelineSelection =
			pending && info?.auxiliaryKeys[0] === 'effects'
				? {type: 'sequence', nodePathInfo: {...info, auxiliaryKeys: []}}
				: item;
		changedSelection ||= next !== item;
		fallback.set(getTimelineSelectionKey(next), next);
	}

	if (changedSelection)
		currentSelection?.current.selectItems([...fallback.values()]);
	const expectedRevision = getEffectDeletionSelectionRevision();
	const sourceSession = getSequencePropsSourceSession();
	try {
		const request = [...grouped.values()].flatMap(({nodePath, effectIndices}) =>
			effectIndices.map((effectIndex) => ({
				type: 'single-effect' as const,
				fileName: nodePath.absolutePath,
				sequenceNodePath: nodePath,
				effectIndex,
			})),
		);
		authorizeEffectDeletionRequest(request);
		const result = await deleteEffects(request);
		if (!result.success) throw new Error(result.reason);
		Internals.OptimisticEffectDeletion.batch(() => {
			for (const entry of entries)
				if (entry) Internals.OptimisticEffectDeletion.acknowledge(entry);
		});
		return {status: 'success'};
	} catch (error) {
		const canRestore =
			changedSelection &&
			getEffectDeletionSelectionRevision() === expectedRevision &&
			sourceSession === getSequencePropsSourceSession() &&
			entries.every(
				(entry) =>
					entry &&
					!entry.sourceChanged &&
					Internals.OptimisticEffectDeletion.get(entry.nodePath) === entry,
			);
		Internals.OptimisticEffectDeletion.batch(() => {
			for (const entry of entries)
				if (entry) Internals.OptimisticEffectDeletion.remove(entry);
		});
		if (canRestore)
			currentSelection?.current.selectItems(
				previousSelection.map((selection) => {
					if (!('nodePathInfo' in selection)) return selection;
					const source = selection.nodePathInfo.sequenceSubscriptionKey;
					const entry = entriesByOriginalPath.get(
						JSON.stringify([source.absolutePath, source.nodePath]),
					);
					return entry
						? {
								...selection,
								nodePathInfo: {
									...selection.nodePathInfo,
									sequenceSubscriptionKey: entry.nodePath,
								},
							}
						: selection;
				}),
			);
		const reason = error instanceof Error ? error.message : String(error);
		showNotification(`Could not delete effect: ${reason}`, 4000);
		return {status: 'error', reason};
	}
};

export const useDeleteEffects = () => {
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	return useCallback(
		(targets: readonly EffectDeletionTarget[]) =>
			deleteEffectsFromSource(targets, currentSelection),
		[currentSelection],
	);
};
