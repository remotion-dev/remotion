import {useCallback} from 'react';
import type {EffectDefinition, SequencePropsSubscriptionKey} from 'remotion';
import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import {deleteEffects} from '../effect-operations-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {useCurrentTimelineSelectionStateAsRef} from './TimelineSelection';

export type EffectDeletionTarget = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndices: readonly number[];
	readonly effects: readonly EffectDefinition<unknown>[];
};
export type EffectDeletionResult =
	| {status: 'success'}
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
	try {
		const request = [...grouped.values()].flatMap(({nodePath, effectIndices}) =>
			effectIndices.map((effectIndex) => ({
				type: 'single-effect' as const,
				fileName: nodePath.absolutePath,
				sequenceNodePath: nodePath,
				effectIndex,
			})),
		);
		const result = await deleteEffects(request);
		if (!result.success) throw new Error(result.reason);
		return {status: 'success'};
	} catch (error) {
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
