import type {
	SequenceNodePathMutation,
	SourceFileVersion,
} from '@remotion/studio-shared';
import {useCallback, useMemo} from 'react';
import type {SequenceNodePath} from 'remotion';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {normalizeSourceFileName} from '../../helpers/rebase-source-request';
import {subscribeToSequenceNodePathMutations} from '../../helpers/sequence-node-path-mutations';
import {useSyncExternalStore} from '../../helpers/use-sync-external-store';

type SourceNode = {absolutePath: string; nodePath: SequenceNodePath};
export type SplitTarget = {
	nodePathInfo: SequenceNodePathInfo;
	splitFrame: number;
	expectedDuration: number;
};
type PendingSplit = {
	targets: (SourceNode & {splitFrame: number; expectedDuration: number})[];
	keys: Set<string>;
	compositionId: string | null;
	superseded: boolean;
	mutations: SequenceNodePathMutation[];
	receivedSourceVersions: Map<string, SourceFileVersion>;
	result: {
		mutationId: string;
		nodes: SourceNode[];
		sourceVersions: ReadonlyMap<string, SourceFileVersion | null>;
	} | null;
	onFinish: () => void;
};
const pending = new Set<PendingSplit>();
const listeners = new Map<string, Set<() => void>>();
let unsubscribe: (() => void) | null = null;
let timeline: {
	compositionId: string | null;
	tracks: readonly TimelineTrackData[];
} | null = null;
const sourceFileKey = (fileName: string) =>
	normalizeSourceFileName(
		fileName,
		typeof window === 'undefined' ? '' : (window.remotion_cwd ?? ''),
	);
const keyForNode = (node: SourceNode) =>
	JSON.stringify([node.absolutePath, node.nodePath]);
const publish = (keys: Iterable<string>) => {
	const callbacks = new Set<() => void>();
	for (const key of keys)
		for (const callback of listeners.get(key) ?? []) callbacks.add(callback);
	for (const callback of callbacks) callback();
};

const remove = (operation: PendingSplit) => {
	if (!pending.delete(operation)) return;
	operation.onFinish();
	publish(operation.keys);
	if (pending.size === 0) {
		unsubscribe?.();
		unsubscribe = null;
	}
};

export const supersedePendingSequenceSplits = (
	nodes: readonly SourceNode[],
) => {
	for (const operation of [...pending]) {
		if (
			!nodes.some((node) =>
				operation.targets.some(
					(target) =>
						node.absolutePath === target.absolutePath &&
						(operation.keys.has(keyForNode(node)) ||
							(node.nodePath.at(-1) === 'openingElement' &&
								node.nodePath
									.slice(0, -1)
									.every((part, index) => target.nodePath[index] === part))),
				),
			)
		)
			continue;
		// A later timing edit owns the preview now. Keep only the in-flight request
		// guard, without waiting for timing that the newer edit has replaced.
		operation.superseded = true;
		if (operation.result) remove(operation);
	}
};

export const clearPendingSequenceSplits = () => {
	for (const operation of [...pending]) remove(operation);
};

export const getPendingSequenceSplits = () =>
	[...pending].flatMap((operation) =>
		operation.targets.map(({absolutePath, nodePath, splitFrame}) => ({
			absolutePath,
			nodePath,
			splitFrame,
		})),
	);
export const isSequenceSplitPending = (nodePathInfo: SequenceNodePathInfo) => {
	const key = keyForNode(nodePathInfo.sequenceSubscriptionKey);
	return [...pending].some((operation) => operation.keys.has(key));
};

export const useAreSequencesSplitting = (
	nodes: readonly SequenceNodePathInfo[],
) => {
	const keys = useMemo(
		() => nodes.map((node) => keyForNode(node.sequenceSubscriptionKey)),
		[nodes],
	);
	const subscribe = useCallback(
		(callback: () => void) => {
			for (const key of keys) {
				let set = listeners.get(key);
				if (!set) {
					set = new Set();
					listeners.set(key, set);
				}

				set.add(callback);
			}

			return () => {
				for (const key of keys) {
					const set = listeners.get(key);
					set?.delete(callback);
					if (set?.size === 0) listeners.delete(key);
				}
			};
		},
		[keys],
	);
	const getSnapshot = useCallback(
		() =>
			[...pending].some((operation) =>
				keys.some((key) => operation.keys.has(key)),
			),
		[keys],
	);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const useIsSplittingSequence = (node: SequenceNodePathInfo | null) => {
	const nodes = useMemo(() => (node ? [node] : []), [node]);
	return useAreSequencesSplitting(nodes);
};

const remapNodes = <T extends SourceNode>(
	nodes: readonly T[],
	mutation: SequenceNodePathMutation,
): T[] => {
	const byFile = new Map(
		mutation.files.map((file) => {
			const byPath = new Map<string, SequenceNodePath | null>();
			for (const mapping of file.remappings)
				if (
					mapping.oldNodePath !== null &&
					!byPath.has(JSON.stringify(mapping.oldNodePath))
				)
					byPath.set(JSON.stringify(mapping.oldNodePath), mapping.newNodePath);
			return [file.absolutePath, byPath];
		}),
	);
	return nodes.flatMap((node) => {
		const map = byFile.get(node.absolutePath);
		for (let {length} = node.nodePath; length > 0; length--) {
			const key = JSON.stringify(
				length === node.nodePath.length
					? node.nodePath
					: [...node.nodePath.slice(0, length), 'openingElement'],
			);
			const mapped = map?.get(key);
			if (mapped === null) return [];
			if (mapped !== undefined)
				return [
					{
						...node,
						nodePath:
							length === node.nodePath.length
								? mapped
								: [...mapped.slice(0, -1), ...node.nodePath.slice(length)],
					},
				];
		}

		return [node];
	});
};

// A right half can reuse an old sibling's runtime ID and source slot. Require
// the original left to be shortened as well; a refresh event alone is not proof.
const reconcile = () => {
	if (pending.size === 0 || timeline === null) return;
	const byPath = new Map(
		timeline.tracks.flatMap((track) =>
			track.nodePathInfo
				? [
						[
							keyForNode(track.nodePathInfo.sequenceSubscriptionKey),
							track,
						] as const,
					]
				: [],
		),
	);
	for (const operation of [...pending]) {
		if (!operation.result) continue;
		if (
			(operation.compositionId !== null &&
				operation.compositionId !== timeline.compositionId) ||
			operation.targets.length === 0
		) {
			remove(operation);
			continue;
		}

		if (
			operation.targets.every((target) => {
				const duration = byPath.get(keyForNode(target))?.sequence.duration;
				return (
					duration !== undefined &&
					Math.abs(duration - target.expectedDuration) <= 1e-9
				);
			}) &&
			operation.result.nodes.every((node) => byPath.has(keyForNode(node)))
		)
			remove(operation);
	}
};

export const beginPendingSequenceSplit = (
	targets: readonly SplitTarget[],
	onFinish: () => void,
): PendingSplit | null => {
	if (targets.some(({nodePathInfo}) => isSequenceSplitPending(nodePathInfo)))
		return null;
	const operation: PendingSplit = {
		targets: targets.map(({nodePathInfo, splitFrame, expectedDuration}) => ({
			absolutePath: nodePathInfo.sequenceSubscriptionKey.absolutePath,
			nodePath: nodePathInfo.sequenceSubscriptionKey.nodePath,
			splitFrame,
			expectedDuration,
		})),
		keys: new Set(
			targets.map(({nodePathInfo}) =>
				keyForNode(nodePathInfo.sequenceSubscriptionKey),
			),
		),
		compositionId: timeline?.compositionId ?? null,
		superseded: false,
		mutations: [],
		receivedSourceVersions: new Map(),
		result: null,
		onFinish,
	};
	pending.add(operation);
	if (unsubscribe === null)
		unsubscribe = subscribeToSequenceNodePathMutations((mutation) => {
			for (const entry of pending) {
				if (entry.result === null) entry.mutations.push(mutation);
				entry.targets = remapNodes(entry.targets, mutation);
				if (entry.result)
					entry.result.nodes = remapNodes(entry.result.nodes, mutation);
				for (const node of entry.targets) entry.keys.add(keyForNode(node));
				publish(entry.keys);
			}

			reconcile();
		});
	publish(operation.keys);
	return operation;
};

export const finishPendingSequenceSplit = remove;
export const acknowledgePendingSequenceSplit = (
	operation: PendingSplit,
	mutationId: string,
	nodes: SourceNode[],
	sourceVersions: readonly {
		absolutePath: string;
		sourceVersion: SourceFileVersion | null;
	}[],
) => {
	if (!pending.has(operation)) return;
	if (
		operation.superseded ||
		sourceVersions.some(({absolutePath, sourceVersion}) => {
			const received = operation.receivedSourceVersions.get(
				sourceFileKey(absolutePath),
			);
			return (
				sourceVersion !== null &&
				received?.sessionId === sourceVersion.sessionId &&
				received.revision > sourceVersion.revision
			);
		})
	) {
		remove(operation);
		return;
	}

	const ownIndex = operation.mutations.findIndex(
		(mutation) => mutation.mutationId === mutationId,
	);
	let currentNodes = nodes;
	if (ownIndex >= 0)
		for (const mutation of operation.mutations.slice(ownIndex + 1))
			currentNodes = remapNodes(currentNodes, mutation);
	operation.result = {
		mutationId,
		nodes: currentNodes,
		sourceVersions: new Map(
			sourceVersions.map(({absolutePath, sourceVersion}) => [
				sourceFileKey(absolutePath),
				sourceVersion,
			]),
		),
	};
	operation.mutations = [];
	operation.receivedSourceVersions.clear();
	reconcile();
};

export const reconcilePendingSequenceSplits = (
	snapshot: NonNullable<typeof timeline>,
) => {
	timeline = snapshot;
	reconcile();
};

// A later source snapshot can replace the split timing before its preview mounts.
// Versions distinguish that edit from delayed notifications for the split itself.
export const observePendingSequenceSplitSourceVersion = (
	absolutePath: string,
	sourceVersion: SourceFileVersion | null,
) => {
	if (sourceVersion === null || pending.size === 0) return;
	const fileKey = sourceFileKey(absolutePath);
	for (const operation of [...pending]) {
		if (
			!operation.targets.some(
				(target) => sourceFileKey(target.absolutePath) === fileKey,
			)
		)
			continue;
		if (operation.result === null) {
			const previous = operation.receivedSourceVersions.get(fileKey);
			if (
				previous?.sessionId !== sourceVersion.sessionId ||
				previous.revision < sourceVersion.revision
			)
				operation.receivedSourceVersions.set(fileKey, sourceVersion);
			continue;
		}

		const written = operation.result.sourceVersions.get(fileKey);
		if (
			written &&
			written.sessionId === sourceVersion.sessionId &&
			sourceVersion.revision > written.revision
		)
			remove(operation);
	}
};
