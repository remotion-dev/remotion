import {useMemo} from 'react';
import type {
	EffectDefinition,
	EffectDescriptor,
} from './effects/effect-types.js';
import {OptimisticEffectPropStatuses} from './optimistic-effect-prop-statuses.js';
import type {SequencePropsSubscriptionKey} from './SequenceManager.js';
import type {CanUpdateSequencePropSource} from './use-schema.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

type EffectId = string;
type NodePath = SequencePropsSubscriptionKey;
type Definition = EffectDefinition<unknown>;
type Descriptor = EffectDescriptor<unknown>;

type Item = {
	readonly id: EffectId;
	readonly definition: Definition;
	readonly originId: EffectId | null;
	readonly descriptor: Descriptor | null;
};

export type OptimisticEffectItem = Item & {
	readonly sourceIndex: number | null;
	readonly runtimeSourceIndex: number | null;
	readonly persistedIndex: number | null;
	readonly propStatuses: Record<string, CanUpdateSequencePropSource> | null;
};

export type OptimisticEffectAction =
	| {
			readonly type: 'restore';
			readonly fromItems: readonly OptimisticEffectItem[];
			readonly movedIds: readonly EffectId[];
			readonly items: readonly OptimisticEffectItem[];
	  }
	| {readonly type: 'delete'; readonly ids: readonly EffectId[]}
	| {readonly type: 'duplicate'; readonly ids: readonly EffectId[]}
	| {
			readonly type: 'add';
			readonly definition: Definition;
			readonly descriptor: Descriptor | null;
			readonly index: number | null;
	  }
	| {
			readonly type: 'reorder';
			readonly id: EffectId;
			readonly beforeId: EffectId | null;
	  };

type OperationAction =
	| Exclude<OptimisticEffectAction, {type: 'add'}>
	| {readonly type: 'add'; readonly beforeId: EffectId | null};

export type OptimisticEffectOperation = {
	readonly id: number;
	readonly addedIds: readonly EffectId[];
	readonly action: OperationAction;
	status: 'queued' | 'acknowledged' | 'settled' | 'failed' | 'cancelled';
	mutationId: string | null;
	nodePath: NodePath;
};

export type OptimisticEffectSnapshot = {
	readonly nodePath: NodePath;
	readonly compiledItems: readonly OptimisticEffectItem[];
	readonly persistedItems: readonly OptimisticEffectItem[];
	readonly items: readonly OptimisticEffectItem[];
	readonly operations: readonly OptimisticEffectOperation[];
};

type Entry = {
	nodePath: NodePath;
	compiled: Item[];
	operations: OptimisticEffectOperation[];
	recipes: Map<EffectId, Item>;
	frozenRuntime: boolean;
	refreshPending: boolean;
	refreshMutationIds: Set<string>;
	refreshSourceRevision: number | null;
	snapshot: OptimisticEffectSnapshot;
};

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();
const nodeListeners = new Map<string, Set<() => void>>();
const installedMutations = new Set<string>();
const acknowledgedMutations = new Set<string>();
let activeSourceRevision: number | null = null;
let nextId = 0;
let nextOperation = 0;
let snapshot: readonly OptimisticEffectSnapshot[] = [];
const emptyItems: readonly OptimisticEffectItem[] = [];
const keyForNode = (node: NodePath) =>
	JSON.stringify([node.absolutePath, node.nodePath]);

const apply = (
	entry: Entry,
	items: Item[],
	operation: OptimisticEffectOperation,
): Item[] | null => {
	const {action} = operation;
	if (action.type === 'restore') {
		const fromIds = new Set(action.fromItems.map((item) => item.id));
		const targetIds = new Set(action.items.map((item) => item.id));
		const restored = items.filter(
			(item) => !fromIds.has(item.id) || targetIds.has(item.id),
		);
		for (
			let targetIndex = 0;
			targetIndex < action.items.length;
			targetIndex++
		) {
			const target = action.items[targetIndex];
			const existingIndex = restored.findIndex((item) => item.id === target.id);
			const isMove =
				action.movedIds.includes(target.id) && existingIndex !== -1;
			if (!isMove && (fromIds.has(target.id) || existingIndex !== -1)) continue;
			const restoredItem = isMove
				? restored.splice(existingIndex, 1)[0]
				: (entry.recipes.get(target.id) ?? target);
			const following = action.items
				.slice(targetIndex + 1)
				.find((item) => restored.some((current) => current.id === item.id));
			const preceding = action.items
				.slice(0, targetIndex)
				.reverse()
				.find((item) => restored.some((current) => current.id === item.id));
			const position = following
				? restored.findIndex((item) => item.id === following.id)
				: preceding
					? restored.findIndex((item) => item.id === preceding.id) + 1
					: restored.length;
			restored.splice(position, 0, restoredItem);
		}

		return restored;
	}

	if (action.type === 'delete') {
		if (action.ids.some((id) => !items.some((item) => item.id === id)))
			return null;
		return items.filter((item) => !action.ids.includes(item.id));
	}

	if (action.type === 'duplicate') {
		if (action.ids.some((id) => !items.some((item) => item.id === id)))
			return null;
		return items.flatMap((item) => {
			const index = action.ids.indexOf(item.id);
			return index === -1
				? [item]
				: [item, entry.recipes.get(operation.addedIds[index])!];
		});
	}

	if (
		action.beforeId !== null &&
		!items.some((item) => item.id === action.beforeId)
	)
		return null;
	if (action.type === 'add') {
		const index =
			action.beforeId === null
				? items.length
				: items.findIndex((item) => item.id === action.beforeId);
		return [
			...items.slice(0, index),
			entry.recipes.get(operation.addedIds[0])!,
			...items.slice(index),
		];
	}

	const moving = items.find((candidate) => candidate.id === action.id);
	if (!moving) return null;
	if (action.beforeId === action.id) return items;
	const remaining = items.filter((candidate) => candidate !== moving);
	const destination =
		action.beforeId === null
			? remaining.length
			: remaining.findIndex((candidate) => candidate.id === action.beforeId);
	return [
		...remaining.slice(0, destination),
		moving,
		...remaining.slice(destination),
	];
};

const update = (entry: Entry) => {
	let items = entry.compiled;
	let persisted = entry.compiled;
	for (const operation of entry.operations) {
		if (operation.status !== 'queued' && operation.status !== 'acknowledged')
			continue;
		const result = apply(entry, items, operation);
		if (result === null) {
			operation.status = 'cancelled';
			continue;
		}

		items = result;
		if (operation.status === 'acknowledged') {
			persisted = apply(entry, persisted, operation) ?? persisted;
		}
	}

	if (
		!entry.operations.some(
			(operation) =>
				operation.status === 'queued' || operation.status === 'acknowledged',
		)
	) {
		entry.frozenRuntime = false;
		entry.refreshMutationIds.clear();
	}

	const compiledIndexes = new Map(
		entry.compiled.map((item, index) => [item.id, index]),
	);
	const persistedIndexes = new Map(
		persisted.map((item, index) => [item.id, index]),
	);
	const describe = (item: Item): OptimisticEffectItem => {
		let origin = item;
		const visited = new Set<EffectId>();
		while (
			!compiledIndexes.has(origin.id) &&
			origin.originId !== null &&
			!visited.has(origin.id)
		) {
			visited.add(origin.id);
			const previous = entry.recipes.get(origin.originId);
			if (!previous) break;
			origin = previous;
		}

		const sourceIndex = compiledIndexes.get(origin.id) ?? null;
		return {
			...item,
			descriptor: sourceIndex === null ? origin.descriptor : null,
			sourceIndex,
			runtimeSourceIndex: sourceIndex,
			persistedIndex: persistedIndexes.get(item.id) ?? null,
			propStatuses: OptimisticEffectPropStatuses.get(entry.nodePath, item.id),
		};
	};

	entry.snapshot = {
		nodePath: entry.nodePath,
		compiledItems: entry.compiled.map(describe),
		persistedItems: persisted.map(describe),
		items: items.map(describe),
		operations: [...entry.operations],
	};
};

const publish = (keys: readonly string[]) => {
	snapshot = [...entries.values()].map((entry) => entry.snapshot);
	for (const key of new Set(keys)) {
		for (const listener of nodeListeners.get(key) ?? []) listener();
	}

	for (const listener of listeners) listener();
};

const settleEntry = (entry: Entry) => {
	let last = -1;
	for (let index = 0; index < entry.operations.length; index++) {
		const operation = entry.operations[index];
		if (operation.status === 'queued') break;
		if (
			operation.status === 'acknowledged' &&
			operation.mutationId !== null &&
			installedMutations.has(operation.mutationId)
		)
			last = index;
	}

	if (last === -1) return false;
	let {compiled} = entry;
	for (const operation of entry.operations.splice(0, last + 1)) {
		if (operation.status !== 'acknowledged') continue;
		compiled = apply(entry, compiled, operation) ?? compiled;
		operation.status = 'settled';
	}

	entry.compiled = compiled.map((item) => ({
		...item,
		originId: item.id,
		descriptor: null,
	}));
	for (const item of entry.compiled) entry.recipes.set(item.id, item);
	update(entry);
	return true;
};

const subscribeToKey = (key: string | null, listener: () => void) => {
	if (key === null) return () => undefined;
	const current = nodeListeners.get(key) ?? new Set<() => void>();
	current.add(listener);
	nodeListeners.set(key, current);
	return () => {
		current.delete(listener);
		if (current.size === 0) nodeListeners.delete(key);
	};
};

const ensure = (
	nodePath: NodePath,
	definitions: readonly Definition[],
): Entry => {
	const key = keyForNode(nodePath);
	const previous = entries.get(key);
	if (previous) return previous;
	const compiled = definitions.map((definition): Item => {
		const id = `effect-${++nextId}`;
		return {id, definition, originId: id, descriptor: null};
	});
	const entry: Entry = {
		nodePath,
		compiled,
		operations: [],
		recipes: new Map(compiled.map((item) => [item.id, item])),
		frozenRuntime: false,
		refreshPending: false,
		refreshMutationIds: new Set(),
		refreshSourceRevision: null,
		snapshot: {
			nodePath,
			compiledItems: [],
			persistedItems: [],
			items: [],
			operations: [],
		},
	};
	update(entry);
	entries.set(key, entry);
	snapshot = [...entries.values()].map((item) => item.snapshot);
	return entry;
};

OptimisticEffectPropStatuses.subscribe((nodePath) => {
	const entry = entries.get(keyForNode(nodePath));
	if (!entry) return;
	update(entry);
	publish([keyForNode(nodePath)]);
});

const entryForEffect = (nodePath: NodePath, id: EffectId) => {
	const entry = entries.get(keyForNode(nodePath));
	if (entry?.recipes.has(id)) return entry;
	return [...entries.values()].find((candidate) => candidate.recipes.has(id));
};

const releaseRefreshedRuntimes = () => {
	const changed: string[] = [];
	for (const [key, entry] of entries) {
		if (
			!entry.frozenRuntime ||
			entry.refreshPending ||
			(entry.refreshSourceRevision !== null &&
				entry.refreshSourceRevision === activeSourceRevision &&
				[...entry.refreshMutationIds].some(
					(id) => !acknowledgedMutations.has(id),
				))
		)
			continue;
		entry.frozenRuntime = false;
		entry.refreshMutationIds.clear();
		update(entry);
		changed.push(key);
	}

	return changed;
};

const acknowledgeOperations = (
	operations: readonly OptimisticEffectOperation[],
	mutationId: string,
) => {
	const changedEntries = new Set<Entry>();
	for (const operation of operations) {
		const entry = entries.get(keyForNode(operation.nodePath));
		if (!entry || operation.status !== 'queued') continue;
		operation.status = 'acknowledged';
		operation.mutationId = mutationId;
		changedEntries.add(entry);
	}

	acknowledgedMutations.add(mutationId);
	const changedKeys: string[] = [];
	for (const entry of changedEntries) {
		update(entry);
		settleEntry(entry);
		changedKeys.push(keyForNode(entry.nodePath));
	}

	changedKeys.push(...releaseRefreshedRuntimes());
	if (changedKeys.length > 0) publish(changedKeys);
};

export const OptimisticEffects = {
	get: (nodePath: NodePath) =>
		entries.get(keyForNode(nodePath))?.snapshot ?? null,
	getItems: (nodePath: NodePath, definitions: readonly Definition[] | null) => {
		const entry =
			definitions === null
				? entries.get(keyForNode(nodePath))
				: ensure(nodePath, definitions);
		return entry?.snapshot.items ?? emptyItems;
	},
	getSnapshot: () => snapshot,
	startSourceMutation: (revision: number) => {
		activeSourceRevision = revision;
	},
	finishSourceMutation: (revision: number) => {
		if (activeSourceRevision === revision) activeSourceRevision = null;
		const changed = releaseRefreshedRuntimes();
		if (changed.length > 0) publish(changed);
	},
	startRefresh: () => {
		for (const entry of entries.values()) {
			if (
				entry.operations.some(
					(operation) =>
						operation.status === 'queued' ||
						operation.status === 'acknowledged',
				)
			) {
				entry.frozenRuntime = true;
				entry.refreshPending = true;
				entry.refreshSourceRevision = activeSourceRevision;
			}
		}
	},
	acknowledgeMutation: (mutationId: string) => {
		acknowledgedMutations.add(mutationId);
		const changed = releaseRefreshedRuntimes();
		if (changed.length > 0) publish(changed);
	},
	getPropStatuses: (nodePath: NodePath, id: EffectId) => {
		const entry = entryForEffect(nodePath, id);
		return entry ? OptimisticEffectPropStatuses.get(entry.nodePath, id) : null;
	},
	setPropStatuses: (
		nodePath: NodePath,
		id: EffectId,
		props: Record<string, CanUpdateSequencePropSource> | null,
	) => {
		const entry = entryForEffect(nodePath, id);
		if (entry) OptimisticEffectPropStatuses.set(entry.nodePath, id, props);
	},
	subscribe: (listener: () => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
	subscribeToNode: (nodePath: NodePath, listener: () => void) =>
		subscribeToKey(keyForNode(nodePath), listener),
	begin: ({
		nodePath,
		definitions,
		action,
	}: {
		nodePath: NodePath;
		definitions: readonly Definition[];
		action: OptimisticEffectAction;
	}): OptimisticEffectOperation => {
		const entry = ensure(nodePath, definitions);
		if (action.type === 'restore') {
			for (const item of action.items) {
				if (!entry.recipes.has(item.id)) entry.recipes.set(item.id, item);
			}
		}

		const added: Item[] =
			action.type === 'add'
				? [
						{
							id: `effect-${++nextId}`,
							definition: action.definition,
							originId: null,
							descriptor: action.descriptor,
						},
					]
				: action.type === 'duplicate'
					? action.ids.map((id) => {
							const item = entry.snapshot.items.find(
								(candidate) => candidate.id === id,
							);
							if (!item) throw new Error('The effect is no longer available.');
							return {
								id: `effect-${++nextId}`,
								definition: item.definition,
								originId: id,
								descriptor: null,
							};
						})
					: [];
		for (const item of added) entry.recipes.set(item.id, item);
		const operation: OptimisticEffectOperation = {
			id: ++nextOperation,
			get nodePath() {
				return entry.nodePath;
			},
			addedIds: added.map((item) => item.id),
			action:
				action.type === 'add'
					? {
							type: 'add',
							beforeId:
								action.index === null
									? null
									: (entry.snapshot.items[action.index]?.id ?? null),
						}
					: action,
			status: 'queued',
			mutationId: null,
		};
		entry.operations.push(operation);
		if (action.type === 'duplicate') {
			action.ids.forEach((id, index) =>
				OptimisticEffectPropStatuses.copy(entry.nodePath, id, added[index].id),
			);
		}

		update(entry);
		publish([keyForNode(entry.nodePath)]);
		return operation;
	},
	resolveIndex: (nodePath: NodePath, id: EffectId) => {
		const index =
			entries
				.get(keyForNode(nodePath))
				?.snapshot.persistedItems.findIndex((item) => item.id === id) ?? -1;
		return index < 0 ? null : index;
	},
	getOperationStatus: (operation: OptimisticEffectOperation) =>
		operation.status,
	setAddedDescriptor: (
		operation: OptimisticEffectOperation,
		descriptor: Descriptor,
	) => {
		const entry = entries.get(keyForNode(operation.nodePath));
		if (
			!entry ||
			operation.action.type !== 'add' ||
			operation.status === 'failed' ||
			operation.status === 'cancelled' ||
			operation.status === 'settled'
		)
			return;
		const id = operation.addedIds[0];
		const item = entry.recipes.get(id);
		if (!item) return;
		for (const recipe of entry.recipes.values()) {
			let origin = recipe;
			const visited = new Set<string>();
			while (
				origin.id !== id &&
				origin.originId !== null &&
				!visited.has(origin.id)
			) {
				visited.add(origin.id);
				const previous = entry.recipes.get(origin.originId);
				if (!previous) break;
				origin = previous;
			}

			if (origin.id !== id) continue;
			entry.recipes.set(recipe.id, {
				...recipe,
				definition: descriptor.definition,
				descriptor: recipe.id === id ? descriptor : recipe.descriptor,
			});
		}

		update(entry);
		publish([keyForNode(entry.nodePath)]);
	},
	acknowledge: (operation: OptimisticEffectOperation, mutationId: string) =>
		acknowledgeOperations([operation], mutationId),
	acknowledgeOperations,
	settle: (mutationIds: readonly string[]) => {
		for (const id of mutationIds) installedMutations.add(id);
		const keys: string[] = [];
		for (const [key, entry] of entries) {
			if (entry.frozenRuntime) {
				entry.refreshPending = false;
				for (const id of mutationIds) entry.refreshMutationIds.add(id);
			}

			if (settleEntry(entry)) keys.push(key);
		}

		keys.push(...releaseRefreshedRuntimes());
		if (keys.length > 0) publish(keys);
	},
	rollback: (operation: OptimisticEffectOperation) => {
		const entry = entries.get(keyForNode(operation.nodePath));
		if (
			!entry ||
			operation.status === 'settled' ||
			operation.status === 'failed' ||
			operation.status === 'cancelled'
		)
			return;
		operation.status = 'failed';
		update(entry);
		publish([keyForNode(entry.nodePath)]);
	},
	remap: (
		remappings: readonly {
			oldNodePath: NodePath;
			nodePath: NodePath | null;
		}[],
	) => {
		const changes = remappings.map(({oldNodePath, nodePath}) => ({
			oldKey: keyForNode(oldNodePath),
			nodePath,
			entry: entries.get(keyForNode(oldNodePath)),
		}));
		for (const {oldKey} of changes) entries.delete(oldKey);
		OptimisticEffectPropStatuses.remap(remappings);
		const changedKeys: string[] = [];
		for (const {oldKey, nodePath, entry} of changes) {
			if (!entry) continue;
			changedKeys.push(oldKey);
			if (nodePath === null) {
				for (const operation of entry.operations)
					if (operation.status === 'queued') operation.status = 'cancelled';
				continue;
			}

			entry.nodePath = nodePath;
			const newKey = keyForNode(nodePath);
			entries.set(newKey, entry);
			changedKeys.push(newKey);
			update(entry);
		}

		publish(changedKeys);
	},
	clear: () => {
		const keys = [...entries.keys()];
		for (const entry of entries.values())
			for (const operation of entry.operations)
				if (operation.status === 'queued') operation.status = 'cancelled';
		entries.clear();
		OptimisticEffectPropStatuses.clear();
		installedMutations.clear();
		acknowledgedMutations.clear();
		activeSourceRevision = null;
		publish(keys);
	},
	invalidateFile: (absolutePath: string) => {
		const keys: string[] = [];
		for (const [key, entry] of entries) {
			if (entry.nodePath.absolutePath !== absolutePath) continue;
			for (const operation of entry.operations) {
				if (
					operation.status === 'queued' ||
					operation.status === 'acknowledged'
				)
					operation.status = 'cancelled';
			}

			entries.delete(key);
			OptimisticEffectPropStatuses.removeNode(entry.nodePath);
			keys.push(key);
		}

		if (keys.length > 0) publish(keys);
	},
	reconcile: (nodePath: NodePath, definitions: readonly Definition[]) => {
		const entry = entries.get(keyForNode(nodePath));
		if (
			!entry ||
			entry.operations.some(
				(operation) =>
					operation.status === 'queued' || operation.status === 'acknowledged',
			)
		)
			return;
		if (
			entry.compiled.length === definitions.length &&
			entry.compiled.every(
				(item, index) => item.definition === definitions[index],
			)
		)
			return;
		const available = [...entry.compiled];
		const sameOrder =
			entry.compiled.length === definitions.length &&
			entry.compiled.every(
				(item, index) => item.definition.type === definitions[index].type,
			);
		entry.compiled = definitions.map((definition, position) => {
			if (sameOrder) return {...entry.compiled[position], definition};
			const index = available.findIndex(
				(item) => item.definition === definition,
			);
			if (index !== -1) return available.splice(index, 1)[0];
			const sameTypeIndex = available.findIndex(
				(item) => item.definition.type === definition.type,
			);
			if (sameTypeIndex !== -1)
				return {...available.splice(sameTypeIndex, 1)[0], definition};
			const id = `effect-${++nextId}`;
			return {id, definition, originId: id, descriptor: null};
		});
		entry.operations = [];
		entry.recipes = new Map(entry.compiled.map((item) => [item.id, item]));
		update(entry);
		publish([keyForNode(entry.nodePath)]);
	},
	projectEffects: (
		nodePath: NodePath | null,
		effects: readonly Descriptor[],
		history: Map<string, Descriptor> | null,
	): {
		effects: readonly Descriptor[];
		sourceIndices: readonly (number | null)[] | null;
		itemIds: readonly string[] | null;
	} => {
		const entry = nodePath === null ? null : entries.get(keyForNode(nodePath));
		if (
			entry &&
			history &&
			!entry.frozenRuntime &&
			entry.compiled.length === effects.length &&
			entry.compiled.every(
				(item, index) => item.definition === effects[index].definition,
			)
		) {
			entry.compiled.forEach((item, index) =>
				history.set(item.id, effects[index]),
			);
		}

		if (
			!entry ||
			!entry.operations.some(
				(operation) =>
					operation.status === 'queued' || operation.status === 'acknowledged',
			)
		)
			return {
				effects,
				sourceIndices: null,
				itemIds: entry?.snapshot.items.map((item) => item.id) ?? null,
			};
		const projected: Descriptor[] = [];
		const sourceIndices: (number | null)[] = [];
		const itemIds: string[] = [];
		for (const item of entry.snapshot.items) {
			const compiledId =
				item.sourceIndex === null ? null : entry.compiled[item.sourceIndex]?.id;
			const descriptor =
				compiledId !== null && entry.frozenRuntime
					? history?.get(compiledId)
					: item.sourceIndex === null
						? (item.descriptor ??
							history?.get(item.originId ?? item.id) ??
							null)
						: effects[item.sourceIndex];
			if (!descriptor) continue;
			history?.set(item.id, descriptor);
			projected.push(descriptor);
			sourceIndices.push(item.sourceIndex);
			itemIds.push(item.id);
		}

		return {effects: projected, sourceIndices, itemIds};
	},
};

export const useOptimisticEffects = (nodePath: NodePath | null) => {
	const key = nodePath === null ? null : keyForNode(nodePath);
	const observer = useMemo(
		() => ({
			subscribe: (listener: () => void) => subscribeToKey(key, listener),
			getSnapshot: () =>
				key === null ? null : (entries.get(key)?.snapshot ?? null),
		}),
		[key],
	);
	return useSyncExternalStore(
		observer.subscribe,
		observer.getSnapshot,
		() => null,
	);
};
