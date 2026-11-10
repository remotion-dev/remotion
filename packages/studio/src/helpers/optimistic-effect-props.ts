import {
	Internals,
	type CanUpdateEffectPropsResponse,
	type CanUpdateSequencePropSource,
	type CanUpdateSequencePropsResponse,
	type InteractivitySchema,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {deepEqual} from '../components/RenderModal/SchemaEditor/deep-equal';
import {applyEffectResponseToPropStatuses} from '../components/Timeline/apply-effect-response-to-prop-statuses';
import {normalizeSourceFileName} from './rebase-source-request';

type Props = Record<string, CanUpdateSequencePropSource>;
type HistoryUpdate = {
	restore: (direction: 'undo' | 'redo') => {
		rollback: () => void;
		acknowledge: () => void;
	};
};
const requestHistories = new WeakMap<object, readonly HistoryUpdate[]>();
export const attachOptimisticEffectPropHistory = <T extends object>(
	request: T,
	updates: readonly HistoryUpdate[],
): T => {
	requestHistories.set(request, updates);
	return request;
};

export const getOptimisticEffectPropHistory = (request: object) =>
	requestHistories.get(request) ?? [];

const fieldRevisions = new Map<string, Map<string, object>>();
const pendingRevisions = new Set<object>();
const knownEffectIds = new Set<string>();
const rejectedRevisions = new WeakSet<object>();
const revisionBaselines = new WeakMap<
	object,
	{props: Props | null; revisions: ReadonlyMap<string, object>}
>();

const getPreviousFieldRevision = (revision: object, key: string) => {
	let baseline = revisionBaselines.get(revision);
	let previousRevision = baseline?.revisions.get(key);
	while (previousRevision && rejectedRevisions.has(previousRevision)) {
		baseline = revisionBaselines.get(previousRevision);
		previousRevision = baseline?.revisions.get(key);
	}

	return {revision: previousRevision, value: baseline?.props?.[key]};
};

const rollbackRevision = (
	nodePath: SequencePropsSubscriptionKey,
	revision: object,
	changedKeys: ReadonlySet<string>,
) => {
	pendingRevisions.delete(revision);
	rejectedRevisions.add(revision);
	for (const [id, revisions] of fieldRevisions) {
		if (![...changedKeys].some((key) => revisions.get(key) === revision))
			continue;
		const overrides = {
			...Internals.OptimisticEffects.getPropStatuses(nodePath, id),
		};
		for (const key of changedKeys) {
			if (revisions.get(key) !== revision) continue;
			const baseline = getPreviousFieldRevision(revision, key);
			if (baseline.value) overrides[key] = baseline.value;
			else delete overrides[key];
			if (baseline.revision) revisions.set(key, baseline.revision);
			else revisions.delete(key);
		}

		Internals.OptimisticEffects.setPropStatuses(
			nodePath,
			id,
			Object.keys(overrides).length === 0 ? null : overrides,
		);
	}
};

const committedProps = new Map<string, Props>();
let snapshottingProps = false;
const observedStatuses = new Map<
	string,
	{
		nodePath: SequencePropsSubscriptionKey;
		status: CanUpdateSequencePropsResponse;
	}
>();

export const invalidateOptimisticEffectProps = (file: string) => {
	for (const [key, {nodePath}] of observedStatuses) {
		if (normalizeSourceFileName(nodePath.absolutePath, '') === file)
			observedStatuses.delete(key);
	}

	for (const entry of Internals.OptimisticEffects.getSnapshot()) {
		if (normalizeSourceFileName(entry.nodePath.absolutePath, '') !== file)
			continue;
		const ids = new Set([
			...[...entry.items, ...entry.compiledItems, ...entry.persistedItems].map(
				(item) => item.id,
			),
			...entry.operations.flatMap((operation) => operation.addedIds),
		]);
		for (const id of ids) {
			for (const revision of fieldRevisions.get(id)?.values() ?? []) {
				pendingRevisions.delete(revision);
				rejectedRevisions.add(revision);
			}

			fieldRevisions.delete(id);
			committedProps.delete(id);
		}
	}
};

export const snapshotOptimisticEffectProps = (
	nodePath: SequencePropsSubscriptionKey,
	ids: readonly string[],
) => {
	const source = observedStatuses.get(
		JSON.stringify([nodePath.absolutePath, nodePath.nodePath]),
	)?.status;
	const items = Internals.OptimisticEffects.getItems(nodePath, null);
	snapshottingProps = true;
	try {
		for (const id of ids) {
			const item = items.find((candidate) => candidate.id === id);
			if (!item) continue;
			const sourceEffect = source?.canUpdate
				? source.effects.find(
						(effect) => effect.effectIndex === item.sourceIndex,
					)
				: null;
			const overrides = Internals.OptimisticEffects.getPropStatuses(
				nodePath,
				id,
			);
			const baseline =
				committedProps.get(id) ??
				(sourceEffect?.canUpdate ? sourceEffect.props : null);
			if (!baseline && !item.descriptor && !overrides) continue;
			const props: Props = {
				...(baseline
					? baseline
					: Object.fromEntries(
							Object.keys(
								Internals.getFlatSchemaWithAllKeys(item.definition.schema),
							).map((key) => [
								key,
								{
									status: 'static',
									codeValue: (
										item.descriptor?.params as Record<string, unknown> | null
									)?.[key],
									keyframeDisplayOffsetAdjustment: null,
								},
							]),
						)),
				...overrides,
			};
			Internals.OptimisticEffects.setPropStatuses(nodePath, id, props);
		}
	} finally {
		snapshottingProps = false;
	}
};

export const reconcileOptimisticEffectPropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
	status: CanUpdateSequencePropsResponse,
) => {
	const nodeKey = JSON.stringify([nodePath.absolutePath, nodePath.nodePath]);
	const entry = Internals.OptimisticEffects.get(nodePath);
	if (!entry) {
		observedStatuses.set(nodeKey, {nodePath, status});
		return;
	}

	if (
		entry.operations.some(
			(operation) =>
				operation.status === 'queued' || operation.status === 'acknowledged',
		)
	) {
		observedStatuses.delete(nodeKey);
		return;
	}

	observedStatuses.set(nodeKey, {nodePath, status});
	if (!status.canUpdate || status.effects.length !== entry.items.length) return;
	for (const [index, item] of entry.items.entries()) {
		const props = Internals.OptimisticEffects.getPropStatuses(
			nodePath,
			item.id,
		);
		const source = status.effects.find(
			(effect) => effect.effectIndex === index,
		);
		if (source?.canUpdate) committedProps.set(item.id, source.props);
		if (!props || !source?.canUpdate) continue;
		const next = {...props};
		for (const [key, value] of Object.entries(props)) {
			const revision = fieldRevisions.get(item.id)?.get(key);
			if (revision && pendingRevisions.has(revision)) continue;
			if (deepEqual(value, source.props[key])) delete next[key];
		}

		if (Object.keys(next).length === Object.keys(props).length) continue;
		Internals.OptimisticEffects.setPropStatuses(
			nodePath,
			item.id,
			Object.keys(next).length === 0 ? null : next,
		);
	}
};

export const clearIdleOptimisticEffectPropStatuses = () => {
	observedStatuses.clear();
	for (const entry of Internals.OptimisticEffects.getSnapshot()) {
		if (
			entry.operations.some(
				(operation) =>
					operation.status === 'queued' || operation.status === 'acknowledged',
			)
		)
			continue;
		for (const item of entry.items) {
			const props = Internals.OptimisticEffects.getPropStatuses(
				entry.nodePath,
				item.id,
			);
			if (!props) continue;
			const next = Object.fromEntries(
				Object.entries(props).filter(([key]) => {
					const revision = fieldRevisions.get(item.id)?.get(key);
					return revision && pendingRevisions.has(revision);
				}),
			);
			Internals.OptimisticEffects.setPropStatuses(
				entry.nodePath,
				item.id,
				Object.keys(next).length === 0 ? null : next,
			);
		}
	}
};

Internals.OptimisticEffects.subscribe(() => {
	if (snapshottingProps) return;
	if (Internals.OptimisticEffects.getSnapshot().length === 0) {
		observedStatuses.clear();
		fieldRevisions.clear();
		knownEffectIds.clear();
		pendingRevisions.clear();
		committedProps.clear();
		return;
	}

	for (const entry of Internals.OptimisticEffects.getSnapshot()) {
		for (const item of entry.items) {
			if (knownEffectIds.has(item.id)) continue;
			knownEffectIds.add(item.id);
			if (item.originId === null || item.originId === item.id) continue;
			fieldRevisions.set(item.id, new Map(fieldRevisions.get(item.originId)));
		}
	}

	for (const {nodePath, status} of observedStatuses.values())
		reconcileOptimisticEffectPropStatuses(nodePath, status);
});

export const createOptimisticEffectPropUpdate = ({
	nodePath,
	effectIndex,
	fieldKey,
	schema,
	applyOptimistic,
}: {
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	schema: InteractivitySchema;
	applyOptimistic: (
		previous: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse;
}) => {
	const item = Internals.OptimisticEffects.getItems(nodePath, null)[
		effectIndex
	];
	const previousProps = item
		? Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)
		: null;
	const revision = {};
	let beforeProps: Props = {};
	let afterProps: Props = {};
	const previousRevisions = new Map(item ? fieldRevisions.get(item.id) : []);
	revisionBaselines.set(revision, {
		props: previousProps,
		revisions: previousRevisions,
	});
	if (item) pendingRevisions.add(revision);
	const changedKeys = new Set([fieldKey]);
	const revisions = item
		? (fieldRevisions.get(item.id) ?? new Map<string, object>())
		: null;
	if (item && revisions) {
		fieldRevisions.set(item.id, revisions);
		revisions.set(fieldKey, revision);
	}

	const rollback = () => {
		if (!item) return;
		if (fieldRevisions.get(item.id) !== revisions) return;
		rollbackRevision(nodePath, revision, changedKeys);
	};

	const applyKeyframeResponse = (props: Props) => {
		if (!item || fieldRevisions.get(item.id) !== revisions) return;
		pendingRevisions.delete(revision);
		afterProps = props;
		const overrides = {
			...Internals.OptimisticEffects.getPropStatuses(nodePath, item.id),
		};
		for (const key of changedKeys) {
			if (revisions?.get(key) !== revision) continue;
			overrides[key] = props[key] ?? {
				status: 'static',
				codeValue: undefined,
				keyframeDisplayOffsetAdjustment: null,
			};
		}

		Internals.OptimisticEffects.setPropStatuses(nodePath, item.id, overrides);
	};

	return {
		optimistic: Boolean(item),
		applyKeyframeResponse,
		acknowledge: () => {
			pendingRevisions.delete(revision);
			for (const observed of observedStatuses.values())
				reconcileOptimisticEffectPropStatuses(
					observed.nodePath,
					observed.status,
				);
		},
		restore: (direction: 'undo' | 'redo') => {
			if (!item || fieldRevisions.get(item.id) !== revisions)
				return {rollback: () => undefined, acknowledge: () => undefined};
			const restoreRevision = {};
			const currentProps = Internals.OptimisticEffects.getPropStatuses(
				nodePath,
				item.id,
			);
			const currentRevisions = new Map(revisions);
			revisionBaselines.set(restoreRevision, {
				props: currentProps,
				revisions: currentRevisions,
			});
			const restored = direction === 'undo' ? beforeProps : afterProps;
			const next = {...currentProps};
			pendingRevisions.add(restoreRevision);
			for (const key of changedKeys) {
				revisions?.set(key, restoreRevision);
				next[key] = restored[key] ?? {
					status: 'static',
					codeValue: undefined,
					keyframeDisplayOffsetAdjustment: null,
				};
			}

			Internals.OptimisticEffects.setPropStatuses(nodePath, item.id, next);
			return {
				acknowledge: () => {
					pendingRevisions.delete(restoreRevision);
					for (const observed of observedStatuses.values())
						reconcileOptimisticEffectPropStatuses(
							observed.nodePath,
							observed.status,
						);
				},
				rollback: () => {
					if (fieldRevisions.get(item.id) !== revisions) return;
					rollbackRevision(nodePath, restoreRevision, changedKeys);
				},
			};
		},
		applyOptimistic: (
			previous: CanUpdateSequencePropsResponse,
		): CanUpdateSequencePropsResponse => {
			if (!item) return applyOptimistic(previous);
			if (fieldRevisions.get(item.id) !== revisions) return previous;
			const source = previous?.canUpdate
				? previous.effects.find(
						(effect) => effect.effectIndex === item.sourceIndex,
					)
				: null;
			const baseline =
				committedProps.get(item.id) ??
				(source?.canUpdate ? source.props : null);
			const props: Props = {
				...(baseline
					? baseline
					: Object.fromEntries(
							Object.keys(Internals.getFlatSchemaWithAllKeys(schema)).map(
								(key) => [
									key,
									{
										status: 'static',
										codeValue: (
											item.descriptor?.params as Record<string, unknown> | null
										)?.[key],
										keyframeDisplayOffsetAdjustment: null,
									},
								],
							),
						)),
				...Internals.OptimisticEffects.getPropStatuses(nodePath, item.id),
			};
			const projected: CanUpdateSequencePropsResponse = {
				canUpdate: true,
				props: previous?.canUpdate ? previous.props : {},
				durationDependentKeyframes: null,
				effects: [
					{
						canUpdate: true,
						callee: item.definition.label,
						importPath: null,
						effectIndex,
						props,
					},
				],
			};
			beforeProps = props;
			const updated = applyOptimistic(projected);
			const updatedEffect = updated.canUpdate ? updated.effects[0] : null;
			if (!updatedEffect?.canUpdate) return previous;
			afterProps = updatedEffect.props;
			const overrides = {
				...Internals.OptimisticEffects.getPropStatuses(nodePath, item.id),
			};
			for (const key of new Set([
				...Object.keys(props),
				...Object.keys(updatedEffect.props),
			])) {
				if (props[key] === updatedEffect.props[key]) continue;
				overrides[key] = updatedEffect.props[key] ?? {
					status: 'static',
					codeValue: undefined,
					keyframeDisplayOffsetAdjustment: null,
				};
				changedKeys.add(key);
				revisions?.set(key, revision);
			}

			Internals.OptimisticEffects.setPropStatuses(nodePath, item.id, overrides);
			return previous;
		},
		applyResponse: (
			previous: CanUpdateSequencePropsResponse,
			response: CanUpdateEffectPropsResponse,
		): CanUpdateSequencePropsResponse => {
			if (!item) return applyEffectResponseToPropStatuses({previous, response});
			if (fieldRevisions.get(item.id) !== revisions) return previous;
			pendingRevisions.delete(revision);
			if (!response.canUpdate) {
				rollback();
				return previous;
			}

			applyKeyframeResponse(response.props);
			return previous;
		},
		rollback,
	};
};
