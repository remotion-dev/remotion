import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import {useCallback} from 'react';
import {Internals, type SequencePropsSubscriptionKey} from 'remotion';
import {useSyncExternalStore} from './use-sync-external-store';

export const getPendingEffectDeletions = () =>
	Internals.OptimisticEffectDeletion.getSnapshot();

export const isEffectDeletionPending = (
	nodePath: SequencePropsSubscriptionKey,
) => Internals.OptimisticEffectDeletion.get(nodePath) !== null;

export const usePendingEffectDeletions = () =>
	useSyncExternalStore(
		Internals.OptimisticEffectDeletion.subscribe,
		getPendingEffectDeletions,
		getPendingEffectDeletions,
	);

export const useIsEffectDeletionPending = (
	nodePath: SequencePropsSubscriptionKey,
) => {
	const subscribe = useCallback(
		(listener: () => void) =>
			Internals.OptimisticEffectDeletion.subscribeToNode(nodePath, listener),
		[nodePath],
	);
	const getSnapshot = useCallback(
		() => isEffectDeletionPending(nodePath),
		[nodePath],
	);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const assertEffectChainEditable = (
	nodePath: SequencePropsSubscriptionKey,
) => {
	if (isEffectDeletionPending(nodePath))
		throw new Error(
			'Wait for the effect deletion to finish before editing this effect chain.',
		);
};

export const remapOptimisticEffectDeletions = (
	mutation: SequenceNodePathMutation,
) => {
	const entries = getPendingEffectDeletions();
	if (entries.length === 0) return;
	const byFile = new Map(
		mutation.files.map((file) => [
			file.absolutePath,
			new Map(
				file.remappings
					.filter((item) => item.oldNodePath !== null)
					.map((item) => [JSON.stringify(item.oldNodePath), item]),
			),
		]),
	);
	Internals.OptimisticEffectDeletion.remap(
		entries.map((entry) => {
			const path = entry.nodePath.nodePath;
			const mappings = byFile.get(entry.nodePath.absolutePath);
			let oldLength = path.length;
			let remapping = mappings?.get(JSON.stringify(path));
			while (!remapping && oldLength > 1) {
				oldLength--;
				remapping = mappings?.get(
					JSON.stringify([...path.slice(0, oldLength - 1), 'openingElement']),
				);
			}

			if (!remapping) return {entry, nodePath: entry.nodePath};
			return {
				entry,
				nodePath:
					remapping.newNodePath === null
						? null
						: {
								...entry.nodePath,
								nodePath:
									oldLength === path.length
										? remapping.newNodePath
										: [
												...remapping.newNodePath.slice(0, -1),
												...path.slice(oldLength - 1),
											],
							},
			};
		}),
	);
};

let selectionRevision = 0;
export const getEffectDeletionSelectionRevision = () => selectionRevision;
export const invalidateEffectDeletionSelection = () => selectionRevision++;
