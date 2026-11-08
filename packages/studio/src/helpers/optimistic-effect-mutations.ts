import type {
	AddEffectRequest,
	ApiRoutes,
	PasteEffectsRequest,
	ReorderEffectRequest,
} from '@remotion/studio-shared';
import {getRequiredPackageForEffectImportPath} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropSource,
	EffectDefinition,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {EffectPreviewFactory} from '../components/effect-preview-loaders';
import {installRequiredPackages} from './install-required-package';
import {
	getOptimisticEffectPropHistory,
	snapshotOptimisticEffectProps,
} from './optimistic-effect-props';
import {
	getSourceRequestFiles,
	normalizeSourceFileName,
} from './rebase-source-request';
import {
	getActiveSourceMutationRevision,
	getLastDispatchedSourceMutationRevision,
	getSourceMutationRevision,
} from './source-mutation-queue';

type EffectOperation = ReturnType<typeof Internals.OptimisticEffects.begin>;
type EffectItem = ReturnType<
	typeof Internals.OptimisticEffects.getItems
>[number];
type Target = {
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	type: string | null;
};
type Change = {
	operation: EffectOperation;
	before: readonly EffectItem[];
	after: readonly EffectItem[];
};
type HistoryEntry = {
	files: string[];
	dispatched: boolean;
	status: 'pending' | 'saved' | 'failed';
	changes: Change[];
	type: 'edit' | 'undo' | 'redo';
	target: HistoryEntry | null;
	dependency: HistoryEntry | null;
	propHistory: ReturnType<typeof getOptimisticEffectPropHistory>;
	propRestores: ReturnType<
		ReturnType<typeof getOptimisticEffectPropHistory>[number]['restore']
	>[];
};

let history: HistoryEntry[] = [];
let undo: HistoryEntry[] = [];
let redo: HistoryEntry[] = [];
let historySnapshot: {canUndo: boolean | null; canRedo: boolean | null} = {
	canUndo: null,
	canRedo: null,
};
const historyListeners = new Set<() => void>();

const publishHistory = () => {
	undo = [];
	redo = [];
	let fallbackRedo: boolean | null = null;
	for (const entry of history) {
		if (
			entry.changes.some(
				({operation}) =>
					operation.status === 'cancelled' || operation.status === 'failed',
			)
		)
			entry.status = 'failed';
		if (entry.status === 'failed') continue;
		if (entry.type === 'edit') {
			undo.push(entry);
			redo = [];
			fallbackRedo = false;
			continue;
		}

		const from = entry.type === 'undo' ? undo : redo;
		const to = entry.type === 'undo' ? redo : undo;
		if (
			entry.dependency?.status === 'failed' ||
			(entry.target !== null && from.at(-1) !== entry.target)
		) {
			entry.status = 'failed';
			for (const change of entry.changes)
				Internals.OptimisticEffects.rollback(change.operation);
			for (const restore of entry.propRestores) restore.rollback();
			continue;
		}

		if (entry.target !== null) {
			from.pop();
			to.push(entry.target);
		} else {
			fallbackRedo =
				entry.type === 'undo' && entry.status === 'pending' ? true : null;
		}
	}

	if (
		(history.length > 200 || undo.length + redo.length > 100) &&
		history.every((entry) => entry.status !== 'pending')
	) {
		const retained = new Set([...undo, ...[...redo].reverse()].slice(-100));
		undo = undo.filter((entry) => retained.has(entry));
		redo = redo.filter((entry) => retained.has(entry));
		history = [
			...undo,
			...[...redo].reverse(),
			...redo.map(
				(target): HistoryEntry => ({
					files: target.files,
					dispatched: true,
					status: 'saved',
					changes: [],
					type: 'undo',
					target,
					dependency: null,
					propHistory: [],
					propRestores: [],
				}),
			),
		];
	}

	historySnapshot = {
		canUndo: undo.length > 0 ? true : null,
		canRedo: redo.length > 0 ? true : fallbackRedo,
	};
	for (const listener of historyListeners) listener();
};

export const getOptimisticEffectHistorySnapshot = () => historySnapshot;
export const subscribeToOptimisticEffectHistory = (listener: () => void) => {
	historyListeners.add(listener);
	return () => {
		historyListeners.delete(listener);
	};
};

export const clearOptimisticEffectHistory = () => {
	for (const entry of history) entry.status = 'failed';
	history = [];
	publishHistory();
};

export const invalidateOptimisticEffectHistory = (
	file: string,
	resetSavedHistory: boolean,
) => {
	const touchesFile = (entry: HistoryEntry) =>
		entry.files.some((name) => normalizeSourceFileName(name, '') === file);
	const savedUndo: HistoryEntry[] = [];
	const savedRedo: HistoryEntry[] = [];
	for (const entry of history) {
		if (entry.status !== 'saved') continue;
		if (entry.type === 'edit') {
			savedUndo.push(entry);
			savedRedo.length = 0;
		} else if (entry.target !== null) {
			const from = entry.type === 'undo' ? savedUndo : savedRedo;
			const to = entry.type === 'undo' ? savedRedo : savedUndo;
			if (from.at(-1) === entry.target) {
				from.pop();
				to.push(entry.target);
			}
		}
	}

	// An in-flight write may already be committed. Let the server supply its
	// remaining history when its acknowledgement has not reached this client.
	const uncertainHistory = history.some(
		(entry) =>
			entry.status === 'pending' && entry.dispatched && touchesFile(entry),
	);
	const retained = new Set(
		uncertainHistory || resetSavedHistory
			? []
			: [
					...savedUndo.slice(savedUndo.findLastIndex(touchesFile) + 1),
					...savedRedo.slice(savedRedo.findLastIndex(touchesFile) + 1),
				],
	);
	history = history.filter((entry) => {
		if (entry.status === 'saved') {
			return retained.has(entry.type === 'edit' ? entry : entry.target!);
		}

		if (entry.status === 'failed') return false;
		if (touchesFile(entry)) {
			entry.status = 'failed';
			for (const {operation} of entry.changes)
				Internals.OptimisticEffects.rollback(operation);
			for (const restore of entry.propRestores) restore.rollback();
			return false;
		}

		return true;
	});
	publishHistory();
};

export const clearOptimisticEffectHistoryIfIdle = () => {
	if (
		history.some((entry) => entry.status === 'pending') ||
		getActiveSourceMutationRevision() !== null ||
		getLastDispatchedSourceMutationRevision() !== getSourceMutationRevision()
	)
		return;
	clearOptimisticEffectHistory();
};

// Only transport fields are visited: effect params can themselves contain
// objects named effectIndex or sequenceNodePath.
const mapTargets = (
	endpoint: keyof ApiRoutes,
	body: unknown,
	map: (target: Target) => Target | Target[],
): unknown => {
	const object = body as Record<string, unknown>;
	const mapArray = (targets: unknown) =>
		(targets as Target[]).flatMap((target) => map(target));
	switch (endpoint) {
		case '/api/save-effect-props':
		case '/api/add-effect-keyframe':
		case '/api/update-effect-keyframe-settings':
			return map(body as Target);
		case '/api/delete-effect':
		case '/api/duplicate-effect':
			return mapArray(body);
		case '/api/save-multiple-effect-props':
			return {...object, edits: mapArray(object.edits)};
		case '/api/save-sequence-props': {
			const moved = object.movedKeyframes as Record<string, unknown> | null;
			return moved
				? {
						...object,
						movedKeyframes: {
							...moved,
							effectKeyframes: mapArray(moved.effectKeyframes),
						},
					}
				: body;
		}

		case '/api/add-keyframes':
		case '/api/delete-keyframes':
		case '/api/move-keyframes':
		case '/api/batch-update-keyframe-settings':
			return {...object, effectKeyframes: mapArray(object.effectKeyframes)};
		default:
			return body;
	}
};

const placeholderDefinition = (name: string): EffectDefinition<unknown> => ({
	type: `pending-${name}`,
	label: `${name}()`,
	documentationLink: null,
	backend: '2d',
	calculateKey: () => name,
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: {},
	validateParams: () => undefined,
});

export const captureOptimisticEffectMutation = (
	endpoint: keyof ApiRoutes,
	body: unknown,
) => {
	const changes: Change[] = [];
	const bindings: ({
		nodePath: SequencePropsSubscriptionKey;
		ids: string[];
	} | null)[] = [];
	const preparations: {
		operation: EffectOperation;
		name: string;
		importPath: string;
		params: Record<string, unknown>;
	}[] = [];
	const addChange = (
		nodePath: SequencePropsSubscriptionKey,
		action: Parameters<typeof Internals.OptimisticEffects.begin>[0]['action'],
	) => {
		const before = Internals.OptimisticEffects.getItems(nodePath, null);
		snapshotOptimisticEffectProps(
			nodePath,
			before.map((item) => item.id),
		);
		const operation = Internals.OptimisticEffects.begin({
			nodePath,
			definitions: [],
			action,
		});
		changes.push({
			operation,
			before,
			after: Internals.OptimisticEffects.getItems(nodePath, null),
		});
		return operation;
	};

	const entry: HistoryEntry = {
		files: getSourceRequestFiles(body),
		dispatched: false,
		status: 'pending',
		changes,
		type:
			endpoint === '/api/undo'
				? 'undo'
				: endpoint === '/api/redo'
					? 'redo'
					: 'edit',
		target: null,
		dependency: null,
		propHistory:
			typeof body === 'object' && body !== null
				? getOptimisticEffectPropHistory(body)
				: [],
		propRestores: [],
	};
	let reorderOperation: EffectOperation | null = null;
	const pasteOperations: (EffectOperation | null)[] = [];

	if (entry.type !== 'edit') {
		entry.target = (entry.type === 'undo' ? undo : redo).at(-1) ?? null;
		entry.files = entry.target?.files ?? [];
		entry.dependency =
			history.findLast(
				(item) =>
					item.status !== 'failed' &&
					(item === entry.target || item.target === entry.target),
			) ?? null;
		entry.propRestores = (entry.target?.propHistory ?? []).map((prop) =>
			prop.restore(entry.type as 'undo' | 'redo'),
		);
		const targetChanges = entry.target?.changes ?? [];
		const byNode = new Map<
			string,
			{
				operation: EffectOperation;
				before: readonly EffectItem[];
				after: readonly EffectItem[];
				movedIds: string[];
			}
		>();
		for (const change of targetChanges) {
			const key =
				JSON.stringify(change.operation.nodePath.nodePath) +
				change.operation.nodePath.absolutePath;
			byNode.set(key, {
				operation: change.operation,
				before: byNode.get(key)?.before ?? change.before,
				after: change.after,
				movedIds: [
					...(byNode.get(key)?.movedIds ?? []),
					...(change.operation.action.type === 'reorder'
						? [change.operation.action.id]
						: []),
				],
			});
		}

		for (const {operation, before, after, movedIds} of byNode.values()) {
			addChange(operation.nodePath, {
				type: 'restore',
				items: entry.type === 'undo' ? before : after,
				fromItems: entry.type === 'undo' ? after : before,
				movedIds,
			});
		}
	} else {
		const grouped = new Map<
			string,
			{nodePath: SequencePropsSubscriptionKey; ids: string[]}
		>();
		mapTargets(endpoint, body, (target) => {
			const nodePath = target.sequenceNodePath;
			const state = Internals.OptimisticEffects.get(nodePath);
			if (!state) {
				bindings.push(null);
				return target;
			}

			const ids =
				target.type === 'all-effects'
					? state.items.map((item) => item.id)
					: [state.items[target.effectIndex]?.id].filter(
							(id): id is string => id !== undefined,
						);
			if (ids.length === 0 && target.type !== 'all-effects')
				throw new Error(
					'This effect was removed before the edit could be saved.',
				);
			bindings.push({nodePath, ids});
			if (
				endpoint === '/api/delete-effect' ||
				endpoint === '/api/duplicate-effect'
			) {
				const key = JSON.stringify([nodePath.absolutePath, nodePath.nodePath]);
				const group = grouped.get(key) ?? {nodePath, ids: []};
				group.ids.push(...ids.filter((id) => !group.ids.includes(id)));
				grouped.set(key, group);
			}

			return target;
		});
		for (const {nodePath, ids} of grouped.values()) {
			addChange(nodePath, {
				type: endpoint === '/api/delete-effect' ? 'delete' : 'duplicate',
				ids,
			});
		}

		if (endpoint === '/api/reorder-effect') {
			const request = body as ReorderEffectRequest;
			const state = Internals.OptimisticEffects.get(request.sequenceNodePath);
			if (state) {
				const id = state.items[request.fromIndex]?.id;
				if (!id)
					throw new Error(
						'This effect was removed before the edit could be saved.',
					);
				const remaining = state.items.filter((item) => item.id !== id);
				reorderOperation = addChange(request.sequenceNodePath, {
					type: 'reorder',
					id,
					beforeId: remaining[request.toIndex]?.id ?? null,
				});
			}
		}

		if (endpoint === '/api/add-effect') {
			const request = body as AddEffectRequest;
			if (Internals.OptimisticEffects.get(request.sequenceNodePath)) {
				preparations.push({
					operation: addChange(request.sequenceNodePath, {
						type: 'add',
						definition: placeholderDefinition(request.effectName),
						descriptor: null,
						index: null,
					}),
					name: request.effectName,
					importPath: request.effectImportPath,
					params: request.effectConfig,
				});
			}
		}

		if (endpoint === '/api/paste-effects') {
			const request = body as PasteEffectsRequest;
			const state = Internals.OptimisticEffects.get(
				request.targetSequenceNodePath,
			);
			if (state) {
				if (request.type === 'effects-replacing')
					addChange(request.targetSequenceNodePath, {
						type: 'delete',
						ids: state.items.map((item) => item.id),
					});
				const ordered = request.effects
					.map((effect, index) => ({effect, index}))
					.sort(
						(a, b) =>
							(request.insertAtIndices?.[a.index] ?? a.index) -
							(request.insertAtIndices?.[b.index] ?? b.index),
					);
				for (const {effect, index} of ordered) {
					const operation = addChange(request.targetSequenceNodePath, {
						type: 'add',
						definition: placeholderDefinition(effect.callee),
						descriptor: null,
						index: request.insertAtIndices?.[index] ?? null,
					});
					pasteOperations[index] = operation;
					Internals.OptimisticEffects.setPropStatuses(
						request.targetSequenceNodePath,
						operation.addedIds[0],
						Object.fromEntries(
							Object.entries(effect.params).map(
								([key, param]): [string, CanUpdateSequencePropSource] => [
									key,
									param.type === 'static'
										? {
												status: 'static',
												codeValue: param.value,
												keyframeDisplayOffsetAdjustment: null,
											}
										: {
												status: 'keyframed',
												interpolationFunction: param.interpolationFunction,
												keyframes: param.keyframes,
												easing: param.easing,
												clamping: param.clamping,
												output: param.output,
												posterize: param.posterize,
												keyframeDisplayOffsetAdjustment: null,
											},
								],
							),
						),
					);

					preparations.push({
						operation,
						name: effect.callee,
						importPath: effect.importPath,
						params: Object.fromEntries(
							Object.entries(effect.params).map(([key, value]) => [
								key,
								value.type === 'static'
									? value.value
									: value.keyframes[0]?.value,
							]),
						),
					});
				}
			}
		}
	}

	history.push(entry);
	publishHistory();
	const previewPreparation = Promise.all(
		preparations.map(async ({operation, name, importPath, params}) => {
			try {
				const {effectPreviewLoaders} =
					await import('../components/effect-preview-loaders');
				const exports = await effectPreviewLoaders[importPath]?.();
				const factory = exports?.[name] as EffectPreviewFactory | undefined;
				if (factory)
					Internals.OptimisticEffects.setAddedDescriptor(
						operation,
						factory(params),
					);
			} catch {
				// Unsupported previews still persist normally and arrive through HMR.
			}
		}),
	);
	const rollback = () => {
		entry.status = 'failed';
		for (const restore of entry.propRestores) restore.rollback();
		for (const {operation} of changes)
			Internals.OptimisticEffects.rollback(operation);
		publishHistory();
	};

	const resolveIndex = (nodePath: SequencePropsSubscriptionKey, id: string) => {
		const currentNode =
			Internals.OptimisticEffects.getSnapshot().find((snapshot) =>
				snapshot.persistedItems.some((item) => item.id === id),
			)?.nodePath ?? nodePath;
		const index = Internals.OptimisticEffects.resolveIndex(currentNode, id);
		if (index === null)
			throw new Error(
				'This effect was removed before the edit could be saved.',
			);
		return index;
	};

	return {
		files: entry.files,
		rollback,
		prepare: async () => {
			if (entry.status === 'failed')
				throw new Error('The edit this action depended on could not be saved.');
			await previewPreparation;
			if (
				endpoint === '/api/add-effect' &&
				typeof window !== 'undefined' &&
				!window.remotion_browserStudio
			) {
				const packageName = getRequiredPackageForEffectImportPath(
					(body as AddEffectRequest).effectImportPath,
				);
				if (packageName)
					await installRequiredPackages([{name: packageName, version: null}]);
			}
		},
		resolve: (rebasedBody: unknown): unknown => {
			if (
				entry.status === 'failed' ||
				changes.some(
					({operation}) =>
						operation.status === 'cancelled' || operation.status === 'failed',
				)
			)
				throw new Error('The edit this action depended on could not be saved.');
			let cursor = 0;
			entry.dispatched = true;
			const mapped = mapTargets(endpoint, rebasedBody, (target) => {
				const binding = bindings[cursor++];
				if (!binding) return target;
				const {nodePath} = binding;
				if (target.type === 'all-effects')
					return binding.ids.map((id) => ({
						...target,
						type: 'single-effect',
						effectIndex: resolveIndex(nodePath, id),
					}));
				return {...target, effectIndex: resolveIndex(nodePath, binding.ids[0])};
			});
			if (reorderOperation?.action.type === 'reorder') {
				const {action, nodePath} = reorderOperation;
				const fromIndex = resolveIndex(nodePath, action.id);
				const before =
					action.beforeId === null
						? Internals.OptimisticEffects.get(nodePath)!.persistedItems.length
						: resolveIndex(nodePath, action.beforeId);
				return {
					...(mapped as object),
					fromIndex,
					toIndex: before - (fromIndex < before ? 1 : 0),
				};
			}

			if (
				endpoint === '/api/paste-effects' &&
				(body as PasteEffectsRequest).insertAtIndices !== null &&
				pasteOperations.length > 0
			) {
				const items = [
					...Internals.OptimisticEffects.get(
						pasteOperations.find(Boolean)!.nodePath,
					)!.persistedItems.map((item) => item.id),
				];
				const indices: number[] = [];
				for (const {operation} of changes) {
					if (operation.action.type !== 'add') continue;
					const index =
						operation.action.beforeId === null
							? items.length
							: items.indexOf(operation.action.beforeId);
					if (index < 0)
						throw new Error(
							'The effect insertion point is no longer available.',
						);
					indices[pasteOperations.indexOf(operation)] = index;
					items.splice(index, 0, operation.addedIds[0]);
				}

				return {...(mapped as object), insertAtIndices: indices};
			}

			return mapped;
		},
		acknowledge: (mutationId: string | null) => {
			if (
				mutationId === null &&
				[
					'/api/add-effect',
					'/api/delete-effect',
					'/api/duplicate-effect',
					'/api/reorder-effect',
					'/api/paste-effects',
				].includes(endpoint)
			) {
				rollback();
				return;
			}

			entry.status = 'saved';
			for (const restore of entry.propRestores) restore.acknowledge();
			if (mutationId !== null)
				Internals.OptimisticEffects.acknowledgeOperations(
					changes.map(({operation}) => operation),
					mutationId,
				);
			else
				for (const {operation} of changes)
					Internals.OptimisticEffects.rollback(operation);
			publishHistory();
		},
	};
};
