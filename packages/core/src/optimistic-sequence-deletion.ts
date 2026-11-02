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
	rollbackRevision: (revision: number) => {
		for (const [key, deletion] of deletions) {
			if (deletion.revision === revision) {
				deletions.delete(key);
			}
		}

		publish();
	},
	remap: (
		remappings: readonly {
			previousNodePath: Node;
			nodePath: Node | null;
			revision: number;
		}[],
	) => {
		const moves = remappings.flatMap((remapping) => {
			const oldKey = keyForNode(remapping.previousNodePath);
			const deletion = deletions.get(oldKey);
			if (deletion?.id !== remapping.revision) {
				return [];
			}

			const newKey =
				remapping.nodePath === null ? null : keyForNode(remapping.nodePath);
			return oldKey === newKey ? [] : [{oldKey, newKey, deletion}];
		});
		if (moves.length === 0) {
			return;
		}

		// Snapshot every source before writing destinations so sibling swaps
		// cannot move a deletion twice. Its current undo/redo intent follows it.
		for (const {oldKey} of moves) {
			deletions.delete(oldKey);
		}

		for (const {newKey, deletion} of moves) {
			if (newKey === null) {
				continue;
			}

			const existing = deletions.get(newKey);
			if (existing && existing.revision > deletion.revision) {
				continue;
			}

			deletions.set(newKey, deletion);
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
		const keys = nodes.map(keyForNode);
		return () => {
			let changed = false;
			for (const key of keys) {
				// An earlier mutation in this refresh can move the queued deletion
				// into this path after retirement was prepared.
				const deletion = deletions.get(key);
				if (deletion !== undefined && deletion.id <= dispatchedRevision) {
					changed = deletions.delete(key) || changed;
				}
			}

			if (changed) {
				publish();
			}
		};
	},
};
