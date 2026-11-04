import type {
	SequenceNodePathMutation,
	SaveSequencePropsResponse,
	KeyframeMutationResult,
} from '@remotion/studio-shared';
import type {ContextType} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import type {
	CanUpdateSequencePropSource,
	CanUpdateSequencePropsResponse,
	DragOverrideValue,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {
	acceptSequencePropsSourceVersion,
	getSequencePropsSourceSession,
} from '../helpers/sequence-props-source-version';
import {deepEqual} from './RenderModal/SchemaEditor/deep-equal';
import type {SetPropStatuses} from './Timeline/save-sequence-prop';

type Setters = ContextType<typeof Internals.VisualModeSettersContext>;
type Layer = {
	value: DragOverrideValue;
	optimisticStatus: CanUpdateSequencePropSource | null;
	savedStatus: CanUpdateSequencePropSource | null;
	acknowledged: boolean;
	allowEquivalentSource: boolean;
};
type Field = {
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	effectIndex: number | null;
	update: Setters['updateDragOverrides'];
	layers: Layer[];
	visible: DragOverrideValue | null;
	sourceStatus: CanUpdateSequencePropSource | null;
	ownedStatuses: Set<CanUpdateSequencePropSource>;
};
type Store = {
	sourceSessionId: string | null;
	fields: Map<string, Field>;
	remapRevision: number;
};
const stores = new WeakMap<Setters['updateDragOverrides'], Store>();
const fieldKey = (
	nodePath: SequencePropsSubscriptionKey,
	key: string,
	effectIndex: number | null,
) =>
	`${Internals.makeSequencePropsSubscriptionKey(nodePath)}\0${effectIndex ?? 'sequence'}\0${key}`;

const getFieldStatus = (
	response: CanUpdateSequencePropsResponse | undefined,
	key: string,
	effectIndex: number | null,
) => {
	if (!response?.canUpdate) return null;
	if (effectIndex === null) return response.props[key] ?? null;
	const effect = response.effects[effectIndex];
	return effect?.canUpdate ? (effect.props[key] ?? null) : null;
};

const publishField = (
	field: Field,
	force: boolean,
	update: Setters['updateDragOverrides'] | null,
) => {
	const previous = field.visible;
	const next = field.layers.at(-1)?.value ?? null;
	field.visible = next;
	if (previous === next) return;
	(update ?? field.update)(field.nodePath, (current) => {
		if (!force && current[field.key] !== previous) return current;
		const values = {...current};
		if (next === null) delete values[field.key];
		else values[field.key] = next;
		return values;
	});
};

const getFieldStatusRestoration = (
	field: Field,
): Parameters<Setters['setPropStatusesBatch']>[0][number] => {
	const fallback =
		field.layers.findLast((candidate) => candidate.optimisticStatus !== null)
			?.optimisticStatus ?? field.sourceStatus;
	const ownedStatuses = new Set(field.ownedStatuses);
	return {
		nodePath: field.nodePath,
		update: (previous) => {
			const previousStatus = getFieldStatus(
				previous,
				field.key,
				field.effectIndex,
			);
			if (
				!previous?.canUpdate ||
				previousStatus === null ||
				!ownedStatuses.has(previousStatus) ||
				deepEqual(previousStatus, fallback)
			)
				return previous;
			const effect =
				field.effectIndex === null ? null : previous.effects[field.effectIndex];
			if (effect && !effect.canUpdate) return previous;
			const props = {...(effect?.canUpdate ? effect.props : previous.props)};
			if (fallback) props[field.key] = fallback;
			else delete props[field.key];
			if (field.effectIndex === null) return {...previous, props};
			if (!effect?.canUpdate) return previous;
			const effects = [...previous.effects];
			effects[field.effectIndex] = {...effect, props};
			return {...previous, effects};
		},
	};
};

const reconcileField = (
	store: Store,
	field: Field,
	update: Setters['updateDragOverrides'] | null,
) => {
	const confirmed = field.layers.findLastIndex((layer) => {
		if (!layer.acknowledged) return false;
		if (deepEqual(layer.savedStatus, field.sourceStatus)) return true;
		if (
			!layer.allowEquivalentSource ||
			layer.savedStatus?.status !== 'keyframed' ||
			field.sourceStatus?.status !== 'keyframed'
		)
			return false;
		// Changes to descendant animations and effects may not return parsed
		// statuses. Compare their animation while allowing the codemod to preserve an
		// equivalent source expression. The authoritative source stays intact.
		const evaluated = Internals.evaluateSourcePropStatuses(
			{saved: layer.savedStatus, source: field.sourceStatus},
			field.nodePath.videoConfigValues,
		);
		if (
			evaluated.saved.status !== 'keyframed' ||
			evaluated.source.status !== 'keyframed'
		)
			return false;
		return deepEqual(
			{
				...evaluated.saved,
				keyframes: evaluated.saved.keyframes.map((keyframe) => ({
					...keyframe,
					frameExpression: null,
				})),
			},
			{
				...evaluated.source,
				keyframes: evaluated.source.keyframes.map((keyframe) => ({
					...keyframe,
					frameExpression: null,
				})),
			},
		);
	});
	if (confirmed !== -1) field.layers = field.layers.slice(confirmed + 1);
	publishField(field, false, update);
	if (
		field.layers.length === 0 &&
		store.fields.get(fieldKey(field.nodePath, field.key, field.effectIndex)) ===
			field
	)
		store.fields.delete(fieldKey(field.nodePath, field.key, field.effectIndex));
};

// Source notifications may acknowledge an older queued edit. Preserve the latest
// pending field while remembering the actual source as cancellation's fallback.
export const reconcileCanvasDragPreviewStatuses = (
	update: Setters['updateDragOverrides'],
	nodePath: SequencePropsSubscriptionKey,
	response: CanUpdateSequencePropsResponse,
): CanUpdateSequencePropsResponse => {
	const store = stores.get(update);
	if (!store || !response.canUpdate) return response;
	const reconcileProps = (
		source: typeof response.props,
		effectIndex: number | null,
	) => {
		let reconciledProps = source;
		for (const [key, status] of Object.entries(source)) {
			const field = store.fields.get(fieldKey(nodePath, key, effectIndex));
			if (!field) continue;
			field.sourceStatus = status;
			reconcileField(store, field, null);
			const pending = field.layers.findLast(
				(layer) => layer.optimisticStatus !== null,
			)?.optimisticStatus;
			if (pending) {
				if (reconciledProps === source) reconciledProps = {...reconciledProps};
				reconciledProps[key] = pending;
			}
		}

		return reconciledProps;
	};

	const props = reconcileProps(response.props, null);
	let {effects} = response;
	for (let index = 0; index < response.effects.length; index++) {
		const effect = response.effects[index];
		if (!effect.canUpdate) continue;
		const effectProps = reconcileProps(effect.props, index);
		if (effectProps !== effect.props) {
			if (effects === response.effects) effects = [...effects];
			effects[index] = {...effect, props: effectProps};
		}
	}

	return props === response.props && effects === response.effects
		? response
		: {...response, props, effects};
};

export const createCanvasDragPreview = ({
	updateDragOverrides,
	setPropStatuses,
	setPropStatusesBatch,
	getPropStatuses,
}: {
	updateDragOverrides: Setters['updateDragOverrides'];
	setPropStatuses: SetPropStatuses;
	setPropStatusesBatch: Setters['setPropStatusesBatch'] | null;
	getPropStatuses: (
		nodePath: SequencePropsSubscriptionKey,
	) => CanUpdateSequencePropsResponse | undefined;
}) => {
	let store = stores.get(updateDragOverrides);
	if (!store) {
		store = {
			fields: new Map(),
			remapRevision: 0,
			sourceSessionId: getSequencePropsSourceSession(),
		};
		stores.set(updateDragOverrides, store);
	}

	const owned = new Map<Field, Layer>();
	const originalNodes = new Map<string, {field: Field; layer: Layer}>();
	const ownedByNode = new Map<string, [Field, Layer][]>();
	let indexedOwnedSize = -1;
	let indexedRemapRevision = -1;
	let ended = false;
	const effectWriters = new Map<number, Setters['updateDragOverrides']>();
	let sequenceBatchWriter: Setters['updateDragOverridesBatch'] | null = null;
	let effectBatchWriter: Setters['updateEffectDragOverridesBatch'] | null =
		null;
	const publishStatuses = (
		updates: Parameters<Setters['setPropStatusesBatch']>[0],
	) => {
		if (updates.length === 0) return;
		if (setPropStatusesBatch) {
			setPropStatusesBatch(updates);
			return;
		}

		for (const {nodePath, update} of updates) setPropStatuses(nodePath, update);
	};

	const getNodePath = (nodePath: SequencePropsSubscriptionKey) => {
		const original = originalNodes.get(
			Internals.makeSequencePropsSubscriptionKey(nodePath),
		);
		if (!original) return nodePath;
		if (!original.field.layers.includes(original.layer)) return null;
		const current = original.field.nodePath;
		// The source location is shared, but callers can carry different runtime
		// video configurations for evaluating their keyframe expressions.
		return current.absolutePath === nodePath.absolutePath &&
			current.nodePath === nodePath.nodePath
			? nodePath
			: {
					...nodePath,
					absolutePath: current.absolutePath,
					nodePath: current.nodePath,
				};
	};

	const remove = () => {
		if (ended) return;
		ended = true;
		const restorations: Parameters<
			Setters['setPropStatusesBatch']
		>[0][number][] = [];
		for (const [field, layer] of owned) {
			if (!field.layers.includes(layer)) continue;
			field.layers = field.layers.filter((candidate) => candidate !== layer);
			restorations.push(getFieldStatusRestoration(field));
			publishField(field, false, null);
			if (
				field.layers.length === 0 &&
				store.fields.get(
					fieldKey(field.nodePath, field.key, field.effectIndex),
				) === field
			)
				store.fields.delete(
					fieldKey(field.nodePath, field.key, field.effectIndex),
				);
		}

		publishStatuses(restorations);
	};

	const setDragOverrides = ({
		nodePath,
		key,
		value,
		effectIndex,
		update,
		publishUpdate,
	}: {
		nodePath: SequencePropsSubscriptionKey;
		key: string;
		value: DragOverrideValue;
		effectIndex: number | null;
		update: Setters['updateDragOverrides'];
		publishUpdate: Setters['updateDragOverrides'];
	}) => {
		if (ended) return;
		const originalNodeKey =
			Internals.makeSequencePropsSubscriptionKey(nodePath);
		const currentNodePath = getNodePath(nodePath);
		if (currentNodePath === null) return;
		nodePath = currentNodePath;
		const mapKey = fieldKey(nodePath, key, effectIndex);
		let field = store.fields.get(mapKey);
		if (!field) {
			const status = getPropStatuses(nodePath);
			field = {
				nodePath,
				key,
				effectIndex,
				update,
				layers: [],
				visible: null,
				sourceStatus: getFieldStatus(status, key, effectIndex),
				ownedStatuses: new Set(),
			};
			store.fields.set(mapKey, field);
		}

		let layer = owned.get(field);
		if (!layer) {
			layer = {
				value,
				optimisticStatus: null,
				savedStatus: null,
				acknowledged: false,
				allowEquivalentSource: false,
			};
			owned.set(field, layer);
			if (!originalNodes.has(originalNodeKey))
				originalNodes.set(originalNodeKey, {field, layer});
			field.layers.push(layer);
		} else {
			if (
				layer.value.type === 'static' &&
				value.type === 'static' &&
				Object.is(layer.value.value, value.value)
			)
				return;
			layer.value = value;
		}

		publishField(field, true, publishUpdate);
	};

	const setOwnedPropStatuses = (
		nodePath: SequencePropsSubscriptionKey,
		apply: Parameters<SetPropStatuses>[1],
		write: SetPropStatuses,
	) => {
		if (ended) return;
		const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
		if (
			indexedOwnedSize !== owned.size ||
			indexedRemapRevision !== store.remapRevision
		) {
			ownedByNode.clear();
			for (const entry of owned) {
				const nodeKey = Internals.makeSequencePropsSubscriptionKey(
					entry[0].nodePath,
				);
				const fields = ownedByNode.get(nodeKey) ?? [];
				fields.push(entry);
				ownedByNode.set(nodeKey, fields);
			}

			indexedOwnedSize = owned.size;
			indexedRemapRevision = store.remapRevision;
		}

		const matching = (ownedByNode.get(key) ?? []).filter(([field, layer]) =>
			field.layers.includes(layer),
		);
		if (matching.length === 0) return;
		write(nodePath, (previous) => {
			if (!matching.some(([field, layer]) => field.layers.includes(layer)))
				return previous;
			const next = apply(previous);
			if (next.canUpdate) {
				for (const [field, layer] of matching) {
					if (
						!field.layers.includes(layer) ||
						Internals.makeSequencePropsSubscriptionKey(field.nodePath) !==
							Internals.makeSequencePropsSubscriptionKey(nodePath)
					)
						continue;
					layer.optimisticStatus = getFieldStatus(
						next,
						field.key,
						field.effectIndex,
					);
					if (layer.optimisticStatus)
						field.ownedStatuses.add(layer.optimisticStatus);
				}
			}

			return next;
		});
	};

	return {
		getNodePath,
		isLatest: () =>
			owned.size > 0 &&
			[...owned].every(([field, layer]) => field.layers.at(-1) === layer),
		setDragOverrides: (
			nodePath: SequencePropsSubscriptionKey,
			key: string,
			value: DragOverrideValue,
		) =>
			setDragOverrides({
				nodePath,
				key,
				value,
				effectIndex: null,
				update: updateDragOverrides,
				publishUpdate: updateDragOverrides,
			}),
		setDragOverridesBatch: (
			values: readonly {
				nodePath: SequencePropsSubscriptionKey;
				key: string;
				value: DragOverrideValue;
			}[],
			updateBatch: Setters['updateDragOverridesBatch'],
		) => {
			sequenceBatchWriter = updateBatch;
			const updates: Parameters<
				Setters['updateDragOverridesBatch']
			>[0][number][] = [];
			const collect: Setters['updateDragOverrides'] = (nodePath, update) => {
				updates.push({nodePath, update});
			};

			for (const value of values)
				setDragOverrides({
					...value,
					effectIndex: null,
					update: updateDragOverrides,
					publishUpdate: collect,
				});
			if (updates.length > 0) updateBatch(updates);
		},
		setEffectDragOverridesBatch: (
			values: readonly {
				nodePath: SequencePropsSubscriptionKey;
				effectIndex: number;
				key: string;
				value: DragOverrideValue;
			}[],
			updateBatch: Setters['updateEffectDragOverridesBatch'],
		) => {
			effectBatchWriter = updateBatch;
			const updates: Parameters<
				Setters['updateEffectDragOverridesBatch']
			>[0][number][] = [];
			for (const value of values) {
				const {effectIndex} = value;
				let writer = effectWriters.get(effectIndex);
				if (!writer) {
					writer = (nodePath, update) =>
						updateBatch([{nodePath, effectIndex, update}]);
					effectWriters.set(effectIndex, writer);
				}

				setDragOverrides({
					...value,
					update: writer,
					publishUpdate: (nodePath, update) =>
						updates.push({nodePath, effectIndex, update}),
				});
			}

			if (updates.length > 0) updateBatch(updates);
		},
		setPropStatuses: ((nodePath, apply) => {
			setOwnedPropStatuses(nodePath, apply, setPropStatuses);
		}) satisfies SetPropStatuses,
		setPropStatusesBatch: (
			updates: Parameters<Setters['setPropStatusesBatch']>[0],
		) => {
			const ownedUpdates: Parameters<
				Setters['setPropStatusesBatch']
			>[0][number][] = [];
			for (const {nodePath, update} of updates) {
				setOwnedPropStatuses(nodePath, update, (path, apply) => {
					ownedUpdates.push({nodePath: path, update: apply});
				});
			}

			publishStatuses(ownedUpdates);
		},
		cancel: remove,
		fail: remove,
		acknowledgeKeyframes: (results: readonly KeyframeMutationResult[]) =>
			unstable_batchedUpdates(() => {
				if (ended) return;
				const saved = new Map<
					string,
					{status: CanUpdateSequencePropSource; current: boolean}
				>();
				for (const result of results) {
					const nodePath = getNodePath(result.nodePath);
					if (nodePath === null) continue;
					const current = acceptSequencePropsSourceVersion(
						updateDragOverrides,
						nodePath,
						result.sourceVersion,
					);
					for (const [key, status] of Object.entries(result.props))
						saved.set(fieldKey(nodePath, key, result.effectIndex), {
							status,
							current,
						});
				}

				const restorations: Parameters<
					Setters['setPropStatusesBatch']
				>[0][number][] = [];
				const sequenceUpdates: Parameters<
					Setters['updateDragOverridesBatch']
				>[0][number][] = [];
				const effectUpdates: Parameters<
					Setters['updateEffectDragOverridesBatch']
				>[0][number][] = [];
				for (const [field, layer] of owned) {
					const layerIndex = field.layers.indexOf(layer);
					if (layerIndex === -1) continue;
					const result = saved.get(
						fieldKey(field.nodePath, field.key, field.effectIndex),
					);
					if (!result) continue;
					// The response is parsed from the persisted edit. Publish it atomically
					// with retiring its preview, even when source notifications are coalesced.
					// Preserve a newer source snapshot observed while HTTP was pending.
					if (result.current) field.sourceStatus = result.status;
					field.layers = field.layers.slice(layerIndex + 1);
					const {effectIndex} = field;
					reconcileField(
						store,
						field,
						effectIndex === null
							? sequenceBatchWriter === null
								? null
								: (nodePath, update) => sequenceUpdates.push({nodePath, update})
							: effectBatchWriter === null
								? null
								: (nodePath, update) =>
										effectUpdates.push({nodePath, effectIndex, update}),
					);
					restorations.push(getFieldStatusRestoration(field));
				}

				if (sequenceUpdates.length > 0) sequenceBatchWriter?.(sequenceUpdates);
				if (effectUpdates.length > 0) effectBatchWriter?.(effectUpdates);
				publishStatuses(restorations);
			}),
		acknowledge: (response: SaveSequencePropsResponse | null) => {
			if (ended) return;
			if (!response?.canUpdate) {
				remove();
				return;
			}

			const results = new Map<string, (typeof response.results)[number]>();
			for (const item of response.results) {
				const key = Internals.makeSequencePropsSubscriptionKey(item.nodePath);
				if (!results.has(key)) results.set(key, item);
			}

			const restorations: Parameters<
				Setters['setPropStatusesBatch']
			>[0][number][] = [];
			for (const [field, layer] of owned) {
				if (!field.layers.includes(layer)) continue;
				const result = results.get(
					Internals.makeSequencePropsSubscriptionKey(field.nodePath),
				);
				layer.acknowledged = true;
				const savedStatus =
					field.effectIndex === null ? result?.props[field.key] : null;
				layer.allowEquivalentSource =
					savedStatus === null || savedStatus === undefined;
				layer.savedStatus = savedStatus ?? layer.optimisticStatus;
				reconcileField(store, field, null);
				if (!field.layers.includes(layer))
					restorations.push(getFieldStatusRestoration(field));
			}

			publishStatuses(restorations);
		},
	};
};

export const resetCanvasDragPreviewsForSourceSession = (
	setters: Pick<
		Setters,
		| 'updateDragOverrides'
		| 'updateDragOverridesBatch'
		| 'updateEffectDragOverridesBatch'
		| 'setPropStatusesBatch'
	>,
	sessionId: string | null,
) => {
	const store = stores.get(setters.updateDragOverrides);
	if (!store || sessionId === null || store.sourceSessionId === sessionId)
		return;
	store.sourceSessionId = sessionId;
	const statuses: Parameters<Setters['setPropStatusesBatch']>[0][number][] = [];
	const sequenceUpdates: Parameters<
		Setters['updateDragOverridesBatch']
	>[0][number][] = [];
	const effectUpdates: Parameters<
		Setters['updateEffectDragOverridesBatch']
	>[0][number][] = [];
	for (const field of store.fields.values()) {
		field.layers = [];
		statuses.push(getFieldStatusRestoration(field));
		const {effectIndex} = field;
		publishField(
			field,
			false,
			effectIndex === null
				? (nodePath, update) => sequenceUpdates.push({nodePath, update})
				: (nodePath, update) =>
						effectUpdates.push({nodePath, effectIndex, update}),
		);
	}

	store.fields.clear();
	unstable_batchedUpdates(() => {
		if (sequenceUpdates.length)
			setters.updateDragOverridesBatch(sequenceUpdates);
		if (effectUpdates.length)
			setters.updateEffectDragOverridesBatch(effectUpdates);
		if (statuses.length) setters.setPropStatusesBatch(statuses);
	});
};

export const remapCanvasDragPreviews = (
	setters: Pick<
		Setters,
		| 'updateDragOverrides'
		| 'remapDragOverrideFields'
		| 'remapEffectDragOverrideFields'
	>,
	mutations: readonly SequenceNodePathMutation[],
) => {
	const store = stores.get(setters.updateDragOverrides);
	if (!store || store.fields.size === 0) return;
	for (const mutation of mutations) {
		const byFile = new Map(
			mutation.files.map((file) => [
				file.absolutePath,
				new Map(
					file.remappings
						.filter((item) => item.oldNodePath !== null)
						.map((item) => [
							JSON.stringify(item.oldNodePath),
							item.newNodePath,
						]),
				),
			]),
		);
		const moves = [...store.fields.values()].flatMap((field) => {
			const nextPath = byFile
				.get(field.nodePath.absolutePath)
				?.get(JSON.stringify(field.nodePath.nodePath));
			if (nextPath === undefined) return [];
			return [
				{
					field,
					previousNodePath: field.nodePath,
					nodePath:
						nextPath === null ? null : {...field.nodePath, nodePath: nextPath},
				},
			];
		});
		if (moves.length > 0) store.remapRevision++;
		setters.remapDragOverrideFields(
			moves
				.filter((move) => move.field.effectIndex === null)
				.map((move) => ({
					previousNodePath: move.previousNodePath,
					nodePath: move.nodePath,
					fields: move.field.visible
						? {[move.field.key]: move.field.visible}
						: {},
				})),
		);
		setters.remapEffectDragOverrideFields(
			moves.flatMap((move) =>
				move.field.effectIndex === null
					? []
					: [
							{
								previousNodePath: move.previousNodePath,
								nodePath: move.nodePath,
								effectIndex: move.field.effectIndex,
								fields: move.field.visible
									? {[move.field.key]: move.field.visible}
									: {},
							},
						],
			),
		);
		for (const move of moves)
			store.fields.delete(
				fieldKey(move.previousNodePath, move.field.key, move.field.effectIndex),
			);
		for (const move of moves) {
			if (move.nodePath === null) {
				move.field.layers = [];
				move.field.visible = null;
			} else {
				move.field.nodePath = move.nodePath;
				store.fields.set(
					fieldKey(move.nodePath, move.field.key, move.field.effectIndex),
					move.field,
				);
			}
		}
	}
};
