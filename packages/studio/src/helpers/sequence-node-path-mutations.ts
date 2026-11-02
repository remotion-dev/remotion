import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {recordDuplicationSelectionMutation} from './duplicated-element-selection';
import {requestInsertedElementSelection} from './inserted-element-selection';
import {
	markSourceRequestPaths,
	normalizeSourceFileName,
} from './rebase-source-request';
import {
	getActiveSourceMutationRevision,
	getLastDispatchedSourceMutationRevision,
	waitForSourceMutationQueue,
} from './source-mutation-queue';

const pendingMutations: SequenceNodePathMutation[] = [];
const pendingDeletionRetirements = new Map<string, () => void>();
const pendingDeletionRemappings = new Map<
	string,
	Parameters<typeof Internals.OptimisticSequenceDeletion.remap>[0][number][]
>();
const seenMutationIds = new Set<string>();
const mutationListeners = new Set<
	(mutation: SequenceNodePathMutation) => void
>();

export const getSequenceNodePathMutationRevision = () => seenMutationIds.size;
export const getPendingSequenceNodePathMutations = () =>
	pendingMutations.slice();
export const prepareSequenceSourceRead = () => {
	const mutations = getPendingSequenceNodePathMutations();
	const sourceRevision = seenMutationIds.size;
	const activeRevision = getActiveSourceMutationRevision();
	const dispatchedRevision = getLastDispatchedSourceMutationRevision();
	const uncertain = activeRevision !== null;
	return (response: unknown) => {
		const current =
			!uncertain &&
			getActiveSourceMutationRevision() === null &&
			dispatchedRevision === getLastDispatchedSourceMutationRevision() &&
			sourceRevision === seenMutationIds.size;
		markSourceRequestPaths(response, mutations, !current);
		return current;
	};
};

export const withSequenceSourceRead = async <T>(
	fileNames: readonly string[],
	run: () => Promise<T>,
): Promise<T> => {
	const root = typeof window === 'undefined' ? '' : (window.remotion_cwd ?? '');
	const files = new Set(
		fileNames.map((fileName) => normalizeSourceFileName(fileName, root)),
	);
	const receivedMutations = getPendingSequenceNodePathMutations();
	const unsubscribe = subscribeToSequenceNodePathMutations((mutation) =>
		receivedMutations.push(mutation),
	);
	try {
		for (let attempt = 0; attempt < 3; attempt++) {
			const finishRead = prepareSequenceSourceRead();
			const result = await run();
			if (
				finishRead(result) &&
				!receivedMutations.some((mutation) =>
					mutation.files.some((file) =>
						files.has(normalizeSourceFileName(file.absolutePath, root)),
					),
				)
			) {
				return result;
			}

			// Never publish or reuse a successful response of uncertain identity.
			// A failed/no-op write leaves locations intact, so reread after it ends.
			await waitForSourceMutationQueue();
			if (
				receivedMutations.some((mutation) =>
					mutation.files.some((file) =>
						files.has(normalizeSourceFileName(file.absolutePath, root)),
					),
				)
			) {
				break;
			}
		}

		throw new Error(
			'The source changed while loading controls. Wait for the preview to update, then try again.',
		);
	} finally {
		unsubscribe();
	}
};

export const queuePendingSequenceDeletionRemappings = (
	mutationId: string,
	remappings: Parameters<typeof Internals.OptimisticSequenceDeletion.remap>[0],
) => {
	const pending = pendingDeletionRemappings.get(mutationId) ?? [];
	pending.push(...remappings);
	pendingDeletionRemappings.set(mutationId, pending);
};

export const subscribeToSequenceNodePathMutations = (
	listener: (mutation: SequenceNodePathMutation) => void,
) => {
	mutationListeners.add(listener);
	return () => {
		mutationListeners.delete(listener);
	};
};

export const queueSequenceNodePathMutation = (
	mutation: SequenceNodePathMutation,
): void => {
	if (seenMutationIds.has(mutation.mutationId)) {
		return;
	}

	seenMutationIds.add(mutation.mutationId);
	pendingMutations.push(mutation);
	recordDuplicationSelectionMutation(mutation);
	markSourceRequestPaths(
		{
			results: [
				mutation.timelineSelection,
				...mutation.files.flatMap((file) =>
					file.remappings.flatMap((remapping) =>
						remapping.newNodePath === null
							? []
							: [{nodePath: remapping.newNodePath}],
					),
				),
			],
		},
		pendingMutations,
		false,
	);
	pendingDeletionRetirements.set(
		mutation.mutationId,
		Internals.OptimisticSequenceDeletion.prepareRetirement(
			mutation.files.flatMap((file) =>
				file.remappings.flatMap((remapping) =>
					remapping.oldNodePath === null
						? []
						: [
								{
									absolutePath: file.absolutePath,
									nodePath: remapping.oldNodePath,
								},
							],
				),
			),
			getLastDispatchedSourceMutationRevision(),
		),
	);

	if (mutation.timelineSelection !== null) {
		requestInsertedElementSelection({
			compositionId: mutation.timelineSelection.compositionId,
			nodePath: {
				absolutePath: mutation.timelineSelection.absolutePath,
				nodePath: mutation.timelineSelection.nodePath,
			},
			notification: null,
		});
	}

	for (const listener of mutationListeners) {
		listener(mutation);
	}
};

export const queueSequenceNodePathMutationFromApiResponse = (
	response: unknown,
): void => {
	if (
		typeof response !== 'object' ||
		response === null ||
		!('nodePathMutation' in response)
	) {
		return;
	}

	const {nodePathMutation} = response;
	if (
		typeof nodePathMutation !== 'object' ||
		nodePathMutation === null ||
		!('mutationId' in nodePathMutation) ||
		typeof nodePathMutation.mutationId !== 'string'
	) {
		return;
	}

	queueSequenceNodePathMutation(nodePathMutation as SequenceNodePathMutation);
};

export const takePendingSequenceNodePathMutations =
	(): SequenceNodePathMutation[] => {
		const mutations = pendingMutations.splice(0);
		for (const mutation of mutations) {
			pendingDeletionRetirements.get(mutation.mutationId)?.();
			pendingDeletionRetirements.delete(mutation.mutationId);
			const remappings = pendingDeletionRemappings.get(mutation.mutationId);
			if (remappings) {
				Internals.OptimisticSequenceDeletion.remap(remappings);
				pendingDeletionRemappings.delete(mutation.mutationId);
			}
		}

		return mutations;
	};
