import {isValidElement, type ReactNode} from 'react';
import type {SequenceNodePath} from './SequenceManager.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

type Node = {absolutePath: string; nodePath: SequenceNodePath};
type Deletion = {id: number; revision: number; deleted: boolean};
const deletions = new Map<string, Deletion>();
const stackToNode = new Map<string, string>();
const listeners = new Set<() => void>();
const empty = new Set<string>();
let snapshot: ReadonlySet<string> = empty;

const keyForNode = (node: Node) =>
	JSON.stringify([node.absolutePath, node.nodePath]);

const publish = (force = false) => {
	const next = new Set(
		[...deletions].filter(([, value]) => value.deleted).map(([key]) => key),
	);
	if (
		!force &&
		next.size === snapshot.size &&
		[...next].every((key) => snapshot.has(key))
	) {
		return;
	}

	snapshot = next.size === 0 ? empty : next;
	for (const listener of listeners) {
		listener();
	}
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

export const usePendingSequenceDeletions = () => {
	const environment = useRemotionEnvironment();
	const value = useSyncExternalStore(
		subscribe,
		() => snapshot,
		() => empty,
	);
	return environment.isStudio && !environment.isRendering ? value : empty;
};

export const OptimisticSequenceDeletion = {
	register: (stack: string | null, node: Node | null) => {
		if (stack === null || node === null) {
			return;
		}

		const key = keyForNode(node);
		if (stackToNode.get(stack) === key) {
			return;
		}

		stackToNode.set(stack, key);
		if (snapshot.size > 0) {
			publish(true);
		}
	},
	isDeleted: (node: Node | null, pending: ReadonlySet<string>) =>
		node !== null && pending.has(keyForNode(node)),
	isElementDeleted: (element: ReactNode, pending: ReadonlySet<string>) => {
		if (
			!isValidElement<{_remotionInternalStack: string | undefined}>(element)
		) {
			return false;
		}

		const stack = element.props._remotionInternalStack;
		const key = stack === undefined ? undefined : stackToNode.get(stack);
		return key !== undefined && pending.has(key);
	},
	set: (nodes: readonly Node[], revision: number, deleted: boolean) => {
		for (const node of nodes) {
			const key = keyForNode(node);
			const previous = deletions.get(key);
			if (previous && previous.revision > revision) {
				continue;
			}

			deletions.set(key, {id: revision, revision, deleted});
		}

		publish();
	},
	rollback: (nodes: readonly Node[], revision: number) => {
		for (const node of nodes) {
			const key = keyForNode(node);
			if (deletions.get(key)?.revision === revision) {
				deletions.delete(key);
			}
		}

		publish();
	},
	// Undo/redo can only update deletions still represented by the loaded tree.
	// Once source remapping retires them, restoration is handled by HMR.
	restore: (nodes: readonly Node[], revision: number, deleted: boolean) => {
		for (const node of nodes) {
			const key = keyForNode(node);
			const previous = deletions.get(key);
			if (previous && previous.revision <= revision) {
				deletions.set(key, {...previous, revision, deleted});
			}
		}

		publish();
	},
	prepareRetirement: (nodes: readonly Node[], dispatchedRevision: number) => {
		const captured = nodes.map((node) => {
			const key = keyForNode(node);
			return {key, id: deletions.get(key)?.id};
		});
		return () => {
			let changed = false;
			for (const {key, id} of captured) {
				if (
					id !== undefined &&
					id <= dispatchedRevision &&
					deletions.get(key)?.id === id
				) {
					changed = deletions.delete(key) || changed;
				}
			}

			if (changed) {
				publish();
			}
		};
	},
};
