import {useMemo} from 'react';
import type {EffectDefinition} from './effects/effect-types.js';
import type {SequencePropsSubscriptionKey} from './SequenceManager.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

type Entry = {
	nodePath: SequencePropsSubscriptionKey;
	effectIndices: readonly number[];
	definitions: readonly EffectDefinition<unknown>[];
	sourceChanged: boolean;
};

const entries = new Map<string, Entry>();
const acknowledged = new WeakSet<Entry>();
const listeners = new Set<() => void>();
const nodeListeners = new Map<string, Set<() => void>>();
const nodeSnapshots = new Map<string, {entry: Entry}>();
const empty: readonly Entry[] = [];
let snapshot: readonly Entry[] = empty;
let batchDepth = 0;
const batchedKeys = new Set<string>();
const nodeKeys = new WeakMap<SequencePropsSubscriptionKey, string>();

// Schema keys change when an effect disappears; the source chain stays the same.
const keyForNode = (node: SequencePropsSubscriptionKey) => {
	const cached = nodeKeys.get(node);
	if (cached !== undefined) return cached;
	const key = JSON.stringify([node.absolutePath, node.nodePath]);
	nodeKeys.set(node, key);
	return key;
};

const publish = (keys: readonly string[]) => {
	if (batchDepth > 0) {
		for (const key of keys) batchedKeys.add(key);
		return;
	}

	const changedKeys = new Set(keys);
	for (const key of changedKeys) {
		const entry = entries.get(key);
		if (entry) nodeSnapshots.set(key, {entry: {...entry}});
		else nodeSnapshots.delete(key);
	}

	snapshot = entries.size === 0 ? empty : [...entries.values()];
	for (const key of changedKeys) {
		for (const listener of nodeListeners.get(key) ?? []) listener();
	}

	for (const listener of listeners) listener();
};

const subscribeToKey = (key: string | null, listener: () => void) => {
	if (key === null) return () => undefined;
	const current = nodeListeners.get(key) ?? new Set();
	current.add(listener);
	nodeListeners.set(key, current);
	return () => {
		current.delete(listener);
		if (current.size === 0) nodeListeners.delete(key);
	};
};

const matches = (
	entry: Entry,
	definitions: readonly EffectDefinition<unknown>[],
) =>
	!entry.sourceChanged &&
	entry.definitions.length === definitions.length &&
	entry.definitions.every(
		(definition, index) => definition === definitions[index],
	);

const remove = (entry: Entry) => {
	const key = keyForNode(entry.nodePath);
	if (entries.get(key) !== entry) return;
	entries.delete(key);
	acknowledged.delete(entry);
	publish([key]);
};

export const OptimisticEffectDeletion = {
	batch: <T>(run: () => T): T => {
		batchDepth++;
		try {
			return run();
		} finally {
			batchDepth--;
			if (batchDepth === 0 && batchedKeys.size > 0) {
				const keys = [...batchedKeys];
				batchedKeys.clear();
				publish(keys);
			}
		}
	},
	clear: () => {
		if (entries.size === 0) return;
		const keys = [...entries.keys()];
		for (const entry of entries.values()) acknowledged.delete(entry);
		entries.clear();
		publish(keys);
	},
	begin: ({
		nodePath,
		effectIndices,
		definitions,
	}: {
		nodePath: SequencePropsSubscriptionKey;
		effectIndices: readonly number[];
		definitions: readonly EffectDefinition<unknown>[];
	}): Entry | null => {
		const key = keyForNode(nodePath);
		if (
			entries.has(key) ||
			effectIndices.length === 0 ||
			effectIndices.some(
				(index) =>
					!Number.isInteger(index) || index < 0 || index >= definitions.length,
			)
		)
			return null;
		const entry: Entry = {
			nodePath,
			effectIndices: [...new Set(effectIndices)],
			definitions: [...definitions],
			sourceChanged: false,
		};
		entries.set(key, entry);
		publish([key]);
		return entry;
	},
	remove,
	acknowledge: (entry: Entry) => {
		if (entries.get(keyForNode(entry.nodePath)) !== entry) return;
		acknowledged.add(entry);
		if (entry.sourceChanged) remove(entry);
	},
	get: (nodePath: SequencePropsSubscriptionKey) =>
		entries.get(keyForNode(nodePath)) ?? null,
	getSnapshot: () => snapshot,
	subscribe: (listener: () => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
	subscribeToNode: (
		nodePath: SequencePropsSubscriptionKey,
		listener: () => void,
	) => subscribeToKey(keyForNode(nodePath), listener),
	matches,
	reconcile: (
		nodePath: SequencePropsSubscriptionKey | null,
		definitions: readonly EffectDefinition<unknown>[] | null,
	) => {
		if (nodePath === null || definitions === null) return;
		const key = keyForNode(nodePath);
		const entry = entries.get(key);
		if (!entry || entry.sourceChanged || matches(entry, definitions)) return;
		entry.sourceChanged = true;
		if (acknowledged.has(entry)) remove(entry);
		else publish([key]);
	},
	remap: (
		remappings: readonly {
			entry: Entry;
			nodePath: SequencePropsSubscriptionKey | null;
		}[],
	) => {
		const moves = remappings.flatMap(({entry, nodePath}) => {
			const oldKey = keyForNode(entry.nodePath);
			const newKey = nodePath === null ? null : keyForNode(nodePath);
			return entries.get(oldKey) === entry && oldKey !== newKey
				? [{entry, nodePath, oldKey, newKey}]
				: [];
		});
		if (moves.length === 0) return;
		for (const {oldKey} of moves) entries.delete(oldKey);
		for (const {entry, nodePath, newKey} of moves) {
			if (nodePath === null || newKey === null) {
				acknowledged.delete(entry);
				continue;
			}

			entry.nodePath = nodePath;
			entries.set(newKey, entry);
		}

		publish(
			moves.flatMap(({oldKey, newKey}) =>
				newKey === null ? [oldKey] : [oldKey, newKey],
			),
		);
	},
};

export const useOptimisticEffectDeletion = (
	nodePath: SequencePropsSubscriptionKey | null,
) => {
	const key = nodePath === null ? null : keyForNode(nodePath);
	const observer = useMemo(
		() => ({
			subscribe: (listener: () => void) => subscribeToKey(key, listener),
			getSnapshot: () =>
				key === null ? null : (nodeSnapshots.get(key) ?? null),
		}),
		[key],
	);
	return (
		useSyncExternalStore(observer.subscribe, observer.getSnapshot, () => null)
			?.entry ?? null
	);
};
