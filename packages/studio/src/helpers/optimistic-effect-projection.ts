import {
	Internals,
	type PropStatuses,
	type CanUpdateEffectPropsResponse,
	type CanUpdateSequencePropsResponse,
	type RuntimeValueStore,
	type SequencePropsSubscriptionKey,
	type TSequence,
} from 'remotion';
import {useSyncExternalStore} from './use-sync-external-store';

const descriptorRuntimeValues = new WeakMap<object, RuntimeValueStore>();
const projectionCache = new WeakMap<
	PropStatuses,
	WeakMap<object, PropStatuses>
>();
const baselineById = new Map<string, CanUpdateEffectPropsResponse>();
type ChainBaseline = {
	compiledIds: string;
	sourceEffects: readonly CanUpdateEffectPropsResponse[] | null;
	sourceStatus: Extract<
		CanUpdateSequencePropsResponse,
		{canUpdate: true}
	> | null;
	awaitingFresh: boolean;
};
const chainBaselines = new Map<string, ChainBaseline>();
const baselineChainsById = new Map<string, ChainBaseline>();
Internals.OptimisticEffects.subscribe(() => {
	if (Internals.OptimisticEffects.getSnapshot().length > 0) return;
	baselineById.clear();
	chainBaselines.clear();
	baselineChainsById.clear();
});
const projectedStatuses = new WeakMap<PropStatuses, ReadonlySet<string>>();

export const useOptimisticEffectSnapshot = (): ReturnType<
	typeof Internals.OptimisticEffects.getSnapshot
> =>
	useSyncExternalStore(
		Internals.OptimisticEffects.subscribe,
		Internals.OptimisticEffects.getSnapshot,
		Internals.OptimisticEffects.getSnapshot,
	);

export const projectEffectSequence = <T extends TSequence>(
	sequence: T,
	nodePath: SequencePropsSubscriptionKey,
	projectedItems: ReturnType<
		typeof Internals.OptimisticEffects.getItems
	> | null,
): T => {
	const items =
		projectedItems ??
		Internals.OptimisticEffects.getItems(nodePath, sequence.effects);
	return {
		...sequence,
		effects: items.map((item) => item.definition),
		effectRuntimeValues: items.map((item) => {
			const source =
				item.runtimeSourceIndex === null
					? null
					: sequence.effectRuntimeValues?.[item.runtimeSourceIndex];
			if (source) return source;
			const descriptor = item.descriptor ?? item.definition;
			let store = descriptorRuntimeValues.get(descriptor);
			if (!store) {
				store = Internals.createRuntimeValueStore(
					(item.descriptor?.params ?? {}) as Record<string, unknown>,
				).store;
				descriptorRuntimeValues.set(descriptor, store);
			}

			return store;
		}),
	};
};

export const projectEffectPropStatuses = (
	propStatuses: PropStatuses,
	nodePath: SequencePropsSubscriptionKey,
): PropStatuses => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	if (projectedStatuses.get(propStatuses)?.has(key)) return propStatuses;
	const snapshot = Internals.OptimisticEffects.get(nodePath);
	const source = propStatuses[key];
	if (!snapshot || (source && !source.canUpdate)) return propStatuses;
	const baselineKey = JSON.stringify([
		nodePath.absolutePath,
		nodePath.nodePath,
	]);
	const compiledIds = snapshot.compiledItems.map((item) => item.id).join(',');
	let baseline =
		chainBaselines.get(baselineKey) ??
		snapshot.items.map((item) => baselineChainsById.get(item.id)).find(Boolean);
	if (!baseline) {
		baseline = {
			compiledIds,
			sourceEffects: null,
			sourceStatus: null,
			awaitingFresh: false,
		};
	}

	chainBaselines.set(baselineKey, baseline);
	for (const item of snapshot.items) baselineChainsById.set(item.id, baseline);
	if (source) baseline.sourceStatus = source;

	if (compiledIds !== baseline.compiledIds) {
		baseline.compiledIds = compiledIds;
		baseline.awaitingFresh =
			!source || source.effects === baseline.sourceEffects;
	}

	if (source && source.effects !== baseline.sourceEffects) {
		baseline.sourceEffects = source.effects;
		baseline.awaitingFresh = false;
		for (const item of snapshot.compiledItems) {
			const effect = source.effects.find(
				(candidate) => candidate.effectIndex === item.sourceIndex,
			);
			if (effect) baselineById.set(item.id, effect);
		}
	}

	const sequenceStatus: Extract<
		CanUpdateSequencePropsResponse,
		{canUpdate: true}
	> = source ??
		baseline.sourceStatus ?? {
			canUpdate: true,
			props: {},
			effects: [],
			durationDependentKeyframes: null,
		};
	const cached = projectionCache.get(propStatuses)?.get(snapshot);
	if (cached) return cached;
	const projected: PropStatuses = {
		...propStatuses,
		[key]: {
			...sequenceStatus,
			effects: snapshot.items.map((item, effectIndex) => {
				const raw =
					!source || baseline.awaitingFresh || item.sourceIndex === null
						? null
						: source.effects.find(
								(candidate) => candidate.effectIndex === item.sourceIndex,
							);
				const existing =
					raw ??
					baselineById.get(item.id) ??
					(item.originId ? baselineById.get(item.originId) : null);
				if (
					existing &&
					(item.descriptor === null || raw || !existing.canUpdate)
				) {
					baselineById.set(item.id, existing);
					return existing.canUpdate
						? {
								...existing,
								effectIndex,
								props: {...existing.props, ...item.propStatuses},
							}
						: {...existing, effectIndex};
				}

				const params = (item.descriptor?.params ?? {}) as Record<
					string,
					unknown
				>;
				const effect: CanUpdateEffectPropsResponse = {
					canUpdate: true,
					callee:
						item.definition.type.split('/').at(-1) ?? item.definition.label,
					importPath: null,
					effectIndex,
					props: {
						...Object.fromEntries(
							Object.entries(
								Internals.getFlatSchemaWithAllKeys(item.definition.schema),
							).map(([field, schema]) => [
								field,
								{
									status: 'static' as const,
									codeValue:
										params[field] ??
										('default' in schema ? schema.default : undefined),
									keyframeDisplayOffsetAdjustment: null,
								},
							]),
						),
					},
				};
				baselineById.set(item.id, effect);
				return {...effect, props: {...effect.props, ...item.propStatuses}};
			}),
		},
	};
	projectedStatuses.set(
		projected,
		new Set([...(projectedStatuses.get(propStatuses) ?? []), key]),
	);
	const cache =
		projectionCache.get(propStatuses) ?? new WeakMap<object, PropStatuses>();
	cache.set(snapshot, projected);
	projectionCache.set(propStatuses, cache);
	return projected;
};

export const getProjectedEffectPropStatuses = (
	args: Parameters<typeof Internals.getEffectPropStatusesCtx>[0],
): ReturnType<typeof Internals.getEffectPropStatusesCtx> =>
	Internals.getEffectPropStatusesCtx({
		...args,
		propStatuses: projectEffectPropStatuses(args.propStatuses, args.nodePath),
	});
