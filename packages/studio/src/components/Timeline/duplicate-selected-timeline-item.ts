import {useCallback, useMemo} from 'react';
import type {SequenceNodePath} from 'remotion';
import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import {
	beginDuplicatedElementSelection,
	cancelDuplicatedElementSelection,
	resolveDuplicatedElementSelection,
} from '../../helpers/duplicated-element-selection';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {subscribeToSequenceNodePathMutations} from '../../helpers/sequence-node-path-mutations';
import {useSyncExternalStore} from '../../helpers/use-sync-external-store';
import type {ConfirmationDialogFunction} from '../ConfirmationDialog-types';
import {duplicateNodes} from '../duplicate-nodes-api';
import {duplicateEffects} from '../effect-operations-api';
import {showNotification} from '../Notifications/NotificationCenter';
import type {TimelineSelection} from './TimelineSelection';

const pendingDuplications = new Set<{
	keys: Set<string>;
	nodes: {
		absolutePath: string;
		nodePath: SequenceNodePath;
		originalKey: string;
	}[];
}>();
const pendingDuplicationListeners = new Set<() => void>();

export type SequenceDuplicationResult =
	| {status: 'success'}
	| {status: 'already-pending'}
	| {status: 'cancelled'}
	| {status: 'error'; reason: string};

export const getPendingSequenceDuplications = () =>
	[...pendingDuplications].flatMap((pending) =>
		pending.nodes.map(({absolutePath, nodePath}) => ({absolutePath, nodePath})),
	);

const getDuplicationKey = (nodePathInfo: SequenceNodePathInfo): string => {
	const {absolutePath, nodePath} = nodePathInfo.sequenceSubscriptionKey;
	return JSON.stringify([absolutePath, nodePath]);
};

export const isSequenceDuplicationPending = (
	nodePathInfo: SequenceNodePathInfo,
): boolean => {
	const key = getDuplicationKey(nodePathInfo);
	return [...pendingDuplications].some((pending) => pending.keys.has(key));
};

const subscribeToPendingDuplications = (listener: () => void) => {
	pendingDuplicationListeners.add(listener);
	return () => {
		pendingDuplicationListeners.delete(listener);
	};
};

export const useIsDuplicatingSequence = (
	nodePathInfo: SequenceNodePathInfo,
): boolean => {
	const key = useMemo(() => getDuplicationKey(nodePathInfo), [nodePathInfo]);
	const getSnapshot = useCallback(
		() => [...pendingDuplications].some((pending) => pending.keys.has(key)),
		[key],
	);
	return useSyncExternalStore(
		subscribeToPendingDuplications,
		getSnapshot,
		getSnapshot,
	);
};

const confirmDuplicatingProgrammaticallyDuplicatedSequences = (
	nodePathInfos: readonly SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<boolean> => {
	if (nodePathInfos.length === 0) {
		return Promise.resolve(true);
	}

	if (nodePathInfos.length === 1) {
		const [nodePathInfo] = nodePathInfos;
		return confirm({
			title: 'Duplicate sequence?',
			message:
				'This sequence is programmatically duplicated ' +
				nodePathInfo.numberOfSequencesWithThisNodePath +
				' times in the code. Duplicating inserts another copy. Continue?',
			confirmLabel: 'Duplicate',
		});
	}

	return confirm({
		title: 'Duplicate sequences?',
		message:
			nodePathInfos.length +
			' selected sequences are programmatically duplicated in the code. Duplicating inserts another copy of each. Continue?',
		confirmLabel: 'Duplicate',
	});
};

export const duplicateSequencesFromSource = async (
	nodePathInfos: readonly SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<SequenceDuplicationResult> => {
	const keys = nodePathInfos.map(getDuplicationKey);
	if (
		[...pendingDuplications].some((operation) =>
			keys.some((key) => operation.keys.has(key)),
		)
	) {
		return {status: 'already-pending'};
	}

	const pending = {
		keys: new Set(keys),
		nodes: nodePathInfos.map(({sequenceSubscriptionKey}, index) => ({
			absolutePath: sequenceSubscriptionKey.absolutePath,
			nodePath: sequenceSubscriptionKey.nodePath,
			originalKey: keys[index],
		})),
	};
	const selectionRequest = beginDuplicatedElementSelection();
	let copied = false;
	pendingDuplications.add(pending);
	const unsubscribeFromMutations = subscribeToSequenceNodePathMutations(
		(mutation) => {
			const remappingsByFile = new Map(
				mutation.files.map((file) => {
					const remappings = new Map<
						string,
						(typeof file.remappings)[number]
					>();
					for (const remapping of file.remappings) {
						if (remapping.oldNodePath === null) {
							continue;
						}

						const oldPath = JSON.stringify(remapping.oldNodePath);
						if (!remappings.has(oldPath)) {
							remappings.set(oldPath, remapping);
						}
					}

					return [file.absolutePath, remappings];
				}),
			);
			pending.nodes = pending.nodes.flatMap((node) => {
				const remapping = remappingsByFile
					.get(node.absolutePath)
					?.get(JSON.stringify(node.nodePath));
				if (!remapping) {
					return [node];
				}

				if (remapping.newNodePath === null) {
					return [];
				}

				// Keep the old key guarded until the refreshed tree replaces it.
				pending.keys.add(
					JSON.stringify([node.absolutePath, remapping.newNodePath]),
				);
				return [{...node, nodePath: remapping.newNodePath}];
			});
			for (const listener of pendingDuplicationListeners) {
				listener();
			}
		},
	);

	for (const listener of pendingDuplicationListeners) {
		listener();
	}

	let notification: ReturnType<typeof showNotification> | null = null;
	try {
		const programmaticallyDuplicated = nodePathInfos.filter(
			(nodePathInfo) => nodePathInfo.numberOfSequencesWithThisNodePath > 1,
		);
		const regular = nodePathInfos.filter(
			(nodePathInfo) => nodePathInfo.numberOfSequencesWithThisNodePath <= 1,
		);
		const shouldDuplicateProgrammaticSequences =
			await confirmDuplicatingProgrammaticallyDuplicatedSequences(
				programmaticallyDuplicated,
				confirm,
			);
		const toDuplicate = [...regular];
		if (shouldDuplicateProgrammaticSequences) {
			toDuplicate.push(...programmaticallyDuplicated);
		}

		const selectedKeys = new Set(toDuplicate.map(getDuplicationKey));
		const nodes = pending.nodes
			.filter((node) => selectedKeys.has(node.originalKey))
			.map(({absolutePath, nodePath}) => ({fileName: absolutePath, nodePath}));
		if (nodes.length === 0) {
			return {status: 'cancelled'};
		}

		notification = showNotification('Duplicating...', null);
		const result = await duplicateNodes({nodes});
		if (!result.success) {
			showNotification(result.reason, 4000);
			return {status: 'error', reason: result.reason};
		}

		copied = true;
		resolveDuplicatedElementSelection(
			selectionRequest,
			result.nodePathMutation.mutationId,
			result.duplicatedNodes,
		);

		return {status: 'success'};
	} catch (err) {
		const reason = (err as Error).message;
		showNotification(reason, 4000);
		return {status: 'error', reason};
	} finally {
		if (!copied) {
			cancelDuplicatedElementSelection(selectionRequest);
		}

		notification?.dismiss();
		unsubscribeFromMutations();
		pendingDuplications.delete(pending);

		for (const listener of pendingDuplicationListeners) {
			listener();
		}
	}
};

export const isDuplicatableSequenceRowSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence';
} => selection.type === 'sequence';

export const isDuplicatableEffectSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence-effect';
} => selection.type === 'sequence-effect';

const duplicateEffectsFromSource = (
	effects: readonly (TimelineSelection & {type: 'sequence-effect'})[],
): Promise<void> => {
	return duplicateEffects(
		effects.map((effect) => {
			const nodePath = effect.nodePathInfo.sequenceSubscriptionKey;

			return {
				fileName: nodePath.absolutePath,
				sequenceNodePath: nodePath,
				effectIndex: effect.i,
			};
		}),
	)
		.then((result) => {
			if (!result.success) {
				showNotification(result.reason, 4000);
			}
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
		});
};

export const duplicateSelectedTimelineItems = ({
	selections,
	confirm,
}: {
	selections: readonly TimelineSelection[];
	confirm: ConfirmationDialogFunction;
}): Promise<void | SequenceDuplicationResult> | null => {
	const sequenceSelections = selections.filter(
		isDuplicatableSequenceRowSelection,
	);
	if (sequenceSelections.length > 0) {
		return duplicateSequencesFromSource(
			sequenceSelections.map((selection) => selection.nodePathInfo),
			confirm,
		);
	}

	const effectSelections = selections.filter(isDuplicatableEffectSelection);
	if (effectSelections.length === 0 || !canUseEffectOperations()) {
		return null;
	}

	return duplicateEffectsFromSource(effectSelections);
};
