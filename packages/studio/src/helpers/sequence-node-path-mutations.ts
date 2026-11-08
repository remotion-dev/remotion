import type {
	HotMiddlewareMessage,
	SequenceNodePathMutation,
} from '@remotion/studio-shared';
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
const lastMutationByBuildHash = new Map<string, string | null>();
const unchangedSince = new Map<string, string | null>();
const installedBuildListeners = new Set<() => void>();
const filesWithSourceOnlyRemappings = new Set<string>();

export const invalidateSourceFileRemappings = (fileName: string) => {
	for (let index = pendingMutations.length - 1; index >= 0; index--) {
		const mutation = pendingMutations[index];
		const files = mutation.files.filter(
			(file) => normalizeSourceFileName(file.absolutePath, '') !== fileName,
		);
		if (files.length === mutation.files.length) continue;
		pendingDeletionRemappings.delete(mutation.mutationId);
		pendingDeletionRetirements.delete(mutation.mutationId);
		if (files.length === 0) pendingMutations.splice(index, 1);
		else
			pendingMutations[index] = {...mutation, files, timelineSelection: null};
	}

	filesWithSourceOnlyRemappings.delete(fileName);
};

const notifyInstalledBuild = () => {
	for (const listener of installedBuildListeners) listener();
};

export const subscribeToInstalledMutationBuild = (listener: () => void) => {
	installedBuildListeners.add(listener);
	return () => {
		installedBuildListeners.delete(listener);
	};
};

export const recordSequenceNodePathMutationBuild = (
	hash: string | undefined,
	mutationId: string | null | undefined,
) => {
	if (hash === undefined || mutationId === undefined) {
		lastMutationByBuildHash.clear();
		return;
	}

	const installedHash =
		typeof __webpack_hash__ === 'string' ? __webpack_hash__ : null;
	if (installedHash !== null && lastMutationByBuildHash.has(installedHash)) {
		for (const previousHash of lastMutationByBuildHash.keys()) {
			if (previousHash === installedHash) break;
			lastMutationByBuildHash.delete(previousHash);
		}
	}

	const previousMutationId = lastMutationByBuildHash.get(hash);
	lastMutationByBuildHash.set(hash, mutationId);
	if (
		hash === installedHash &&
		mutationId !== null &&
		mutationId !== previousMutationId &&
		pendingMutations.some((mutation) => mutation.mutationId === mutationId)
	) {
		notifyInstalledBuild();
	}
};

export const recordUnchangedSequenceNodePathMutationBuild = (
	event: Extract<HotMiddlewareMessage, {action: 'project-unchanged'}>,
) => {
	if (
		!seenMutationIds.has(event.sourceMutationId) ||
		pendingMutations.some(
			(mutation) => mutation.mutationId === event.sourceMutationId,
		)
	) {
		unchangedSince.set(event.sourceMutationId, event.previousMutationId);
	}

	recordSequenceNodePathMutationBuild(event.hash, event.sourceMutationId);
};

export const hasSourceOnlyRemappings = (fileName: string): boolean => {
	if (filesWithSourceOnlyRemappings.size === 0) {
		return false;
	}

	const root = typeof window === 'undefined' ? '' : (window.remotion_cwd ?? '');
	return filesWithSourceOnlyRemappings.has(
		normalizeSourceFileName(fileName, root),
	);
};

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
	if (mutation.applyWithoutFastRefresh) {
		for (const file of mutation.files) {
			filesWithSourceOnlyRemappings.add(
				normalizeSourceFileName(file.absolutePath, ''),
			);
		}
	}

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

	if (
		typeof __webpack_hash__ === 'string' &&
		lastMutationByBuildHash.get(__webpack_hash__) === mutation.mutationId
	) {
		notifyInstalledBuild();
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

export const takePendingSequenceNodePathMutations = (
	onlyWithoutFastRefresh = false,
) => {
	let lastCompiledIndex = onlyWithoutFastRefresh
		? -1
		: pendingMutations.length - 1;
	if (
		!onlyWithoutFastRefresh &&
		lastMutationByBuildHash.size > 0 &&
		typeof __webpack_hash__ === 'string'
	) {
		const mutationId = lastMutationByBuildHash.get(__webpack_hash__);
		lastCompiledIndex = pendingMutations.findIndex(
			(mutation) => mutation.mutationId === mutationId,
		);
	}

	const nextRefresh = pendingMutations.findIndex(
		(mutation, index) =>
			index > lastCompiledIndex && !mutation.applyWithoutFastRefresh,
	);
	const mutations = pendingMutations.splice(
		0,
		nextRefresh === -1 ? pendingMutations.length : nextRefresh,
	);
	let changes = mutations;
	if (mutations.length > 0 && unchangedSince.size > 0) {
		const indexes = new Map(
			mutations.map((mutation, i) => [mutation.mutationId, i]),
		);
		changes = [];
		for (let i = mutations.length - 1; i >= 0; ) {
			const mutation = mutations[i];
			const previousId = unchangedSince.get(mutation.mutationId);
			if (previousId !== undefined) {
				const previousIndex =
					previousId === null ? -1 : (indexes.get(previousId) ?? -1);
				if (previousIndex < i) {
					i = previousIndex;
					continue;
				}
			}

			changes.push(mutation);
			i--;
		}

		changes.reverse();
	}

	for (const mutation of mutations) {
		unchangedSince.delete(mutation.mutationId);
		pendingDeletionRetirements.get(mutation.mutationId)?.();
		pendingDeletionRetirements.delete(mutation.mutationId);
		const remappings = pendingDeletionRemappings.get(mutation.mutationId);
		if (remappings) {
			Internals.OptimisticSequenceDeletion.remap(remappings);
			pendingDeletionRemappings.delete(mutation.mutationId);
		}
	}

	return {mutations, changes};
};
