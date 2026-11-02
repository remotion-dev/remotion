import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
export * from './sequence-registry-context.js';
import {
	DEFAULT_SEQUENCE_ACTIVITY_LIMIT,
	SequenceActivityContext,
	SequenceActivityDormantContext,
	SequenceActivitySettingsContext,
} from './sequence-activity-context.js';
import {
	SequenceManagerActionsContext,
	SequenceCommitRegistrationContext,
	type SequenceManagerActions,
	type SequenceNodePath,
} from './sequence-registry-context.js';
import {SequenceActivityBudgetProvider} from './SequenceActivityBudget.js';
import {SequenceActivitySuspensionProvider} from './SequenceActivitySuspensionProvider.js';
import {SequenceRegistryProvider} from './SequenceRegistryProvider.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import type {
	CanUpdateSequencePropStatus,
	DragOverrideValue,
	DragOverrides,
	EffectDragOverrides,
	GetDragOverrides,
	GetEffectDragOverrides,
	PropStatuses,
} from './use-schema.js';
import type {SourceNumericValue} from './use-schema.js';
import {useSyncExternalStore} from './use-sync-external-store.js';
import type {VideoConfigValues} from './video-config.js';

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
const useCommitEffect = React.useInsertionEffect ?? useIsomorphicLayoutEffect;

export type VisualModePropStatuses = {
	propStatuses: PropStatuses;
};

export type VisualModePropStatusesRef = {
	current: PropStatuses;
};

export type VisualModeDragOverrides = {
	getDragOverrides: GetDragOverrides;
	getEffectDragOverrides: GetEffectDragOverrides;
};

type DragOverridesSubscription = {
	manager: SequenceManagerActions;
	subscribe: (key: string | null, listener: () => void) => () => void;
	getSnapshot: (key: string | null) => Record<string, DragOverrideValue>;
	subscribeEffects: (key: string | null, listener: () => void) => () => void;
	getEffectSnapshot: (
		key: string | null,
	) => Record<string, Record<string, DragOverrideValue>>;
};

export const VisualModeDragOverridesSubscriptionContext =
	React.createContext<DragOverridesSubscription | null>(null);

type ActiveFromDragOverrideKeys = {
	manager: SequenceManagerActions;
	keys: ReadonlySet<string>;
};

const ActiveFromDragOverrideKeysContext =
	React.createContext<ActiveFromDragOverrideKeys | null>(null);

const SequenceManagerScopeProviders: React.FC<{
	readonly children: React.ReactNode;
	readonly dragOverridesSubscription: Omit<
		DragOverridesSubscription,
		'manager'
	>;
	readonly fromKeys: ReadonlySet<string>;
}> = ({children, dragOverridesSubscription, fromKeys}) => {
	const {isStudio} = useRemotionEnvironment();
	const activitySettings = useContext(SequenceActivitySettingsContext);
	const commitRegistrationEnabled = useContext(
		SequenceCommitRegistrationContext,
	);
	const manager = useContext(SequenceManagerActionsContext);
	const scopedDragOverridesSubscription = useMemo<DragOverridesSubscription>(
		() => ({...dragOverridesSubscription, manager}),
		[dragOverridesSubscription, manager],
	);
	const activeFromDragOverrideKeys = useMemo<ActiveFromDragOverrideKeys>(
		() => ({manager, keys: fromKeys}),
		[fromKeys, manager],
	);
	return (
		<ActiveFromDragOverrideKeysContext.Provider
			value={activeFromDragOverrideKeys}
		>
			<VisualModeDragOverridesSubscriptionContext.Provider
				value={scopedDragOverridesSubscription}
			>
				<SequenceActivityContext.Provider
					value={
						(activitySettings?.limit ?? DEFAULT_SEQUENCE_ACTIVITY_LIMIT) > 0 &&
						isStudio &&
						commitRegistrationEnabled &&
						typeof React.Activity !== 'undefined'
					}
				>
					<SequenceActivitySuspensionProvider>
						<SequenceActivityBudgetProvider>
							{children}
						</SequenceActivityBudgetProvider>
					</SequenceActivitySuspensionProvider>
				</SequenceActivityContext.Provider>
			</VisualModeDragOverridesSubscriptionContext.Provider>
		</ActiveFromDragOverrideKeysContext.Provider>
	);
};

const emptyDragOverrides: Record<string, DragOverrideValue> = {};
const emptyFromOverrideKeys: ReadonlySet<string> = new Set();
const emptyEffectDragOverrides: Record<
	string,
	Record<string, DragOverrideValue>
> = {};

export type SequencePropsStatusRemapping = {
	previousNodePath: SequencePropsSubscriptionKey;
	nodePath: SequencePropsSubscriptionKey | null;
	result: CanUpdateSequencePropsResponse | null;
};

export type VisualModeSetters = {
	setDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		key: string,
		value: DragOverrideValue,
	) => void;
	updateDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		update: (
			current: Readonly<Record<string, DragOverrideValue>>,
		) => Readonly<Record<string, DragOverrideValue>>,
	) => void;
	updateDragOverridesBatch: (
		updates: readonly {
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly update: (
				current: Readonly<Record<string, DragOverrideValue>>,
			) => Readonly<Record<string, DragOverrideValue>>;
		}[],
	) => void;
	remapDragOverrideFields: (
		remappings: readonly {
			readonly previousNodePath: SequencePropsSubscriptionKey;
			readonly nodePath: SequencePropsSubscriptionKey | null;
			readonly fields: Readonly<Record<string, DragOverrideValue>>;
		}[],
	) => void;
	clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	setEffectDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		effectIndex: number,
		key: string,
		value: DragOverrideValue,
	) => void;
	updateEffectDragOverridesBatch: (
		updates: readonly {
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly effectIndex: number;
			readonly update: (
				current: Readonly<Record<string, DragOverrideValue>>,
			) => Readonly<Record<string, DragOverrideValue>>;
		}[],
	) => void;
	remapEffectDragOverrideFields: (
		remappings: readonly {
			readonly previousNodePath: SequencePropsSubscriptionKey;
			readonly nodePath: SequencePropsSubscriptionKey | null;
			readonly effectIndex: number;
			readonly fields: Readonly<Record<string, DragOverrideValue>>;
		}[],
	) => void;
	clearEffectDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		effectIndex: number,
	) => void;
	setPropStatuses: (
		nodePath: SequencePropsSubscriptionKey,
		values: (
			prev: CanUpdateSequencePropsResponse,
		) => CanUpdateSequencePropsResponse,
	) => void;
	setPropStatusesBatch: (
		updates: readonly {
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly update: (
				previous: CanUpdateSequencePropsResponse,
			) => CanUpdateSequencePropsResponse;
		}[],
	) => void;
	remapPropStatuses: (
		remappings: readonly SequencePropsStatusRemapping[],
	) => void;
};

export type VisualModeBatchSetters = {
	setDragOverridesBatch: (
		overrides: readonly {
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly key: string;
			readonly value: DragOverrideValue;
		}[],
	) => void;
	setEffectDragOverridesBatch: (
		overrides: readonly {
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly effectIndex: number;
			readonly key: string;
			readonly value: DragOverrideValue;
		}[],
	) => void;
};

export type CanUpdateEffectPropsResponseTrue<Numeric = SourceNumericValue> = {
	canUpdate: true;
	callee: string;
	importPath: string | null;
	effectIndex: number;
	props: Record<string, CanUpdateSequencePropStatus<Numeric>>;
};

export type CannotUpdateEffectReason =
	| 'not-found'
	| 'computed'
	| 'not-call-expression';

export type CannotUpdateSequenceReason = 'not-found' | 'error';

export type CanUpdateEffectPropsResponseFalse = {
	canUpdate: false;
	effectIndex: number;
	reason: CannotUpdateEffectReason;
};

export type CanUpdateEffectPropsResponse<Numeric = SourceNumericValue> =
	| CanUpdateEffectPropsResponseTrue<Numeric>
	| CanUpdateEffectPropsResponseFalse;

export type CanUpdateSequencePropsResponseTrue<Numeric = SourceNumericValue> = {
	canUpdate: true;
	props: Record<string, CanUpdateSequencePropStatus<Numeric>>;
	effects: CanUpdateEffectPropsResponse<Numeric>[];
	/** Source ranges also include interpolations outside the editable schema. */
	durationDependentKeyframes: {
		readonly scope: SequenceNodePath;
		readonly inputRanges: readonly (readonly SourceNumericValue[] | null)[];
	} | null;
};

export type CanUpdateSequencePropsResponseFalse = {
	canUpdate: false;
	reason: CannotUpdateSequenceReason;
};

export type CanUpdateSequencePropsResponse<Numeric = SourceNumericValue> =
	| CanUpdateSequencePropsResponseTrue<Numeric>
	| CanUpdateSequencePropsResponseFalse;

export const makeSequencePropsSubscriptionKey = (
	key: SequencePropsSubscriptionKey,
): string => {
	return `${key.absolutePath}\0${key.nodePath.join('.')}\0${key.sequenceKeys.join('.')}\0${key.effectKeys.map((keys) => keys.join('.')).join('.')}`;
};

export const VisualModePropStatusesContext =
	React.createContext<VisualModePropStatuses>({
		propStatuses: {},
	});

export const VisualModePropStatusesRefContext =
	React.createContext<VisualModePropStatusesRef>({
		current: {},
	});

export type VisualModePropStatusesSubscription = {
	subscribe: (key: string | null, listener: () => void) => () => void;
	getSnapshot: (key: string | null) => CanUpdateSequencePropsResponse | null;
};

export const VisualModePropStatusesSubscriptionContext =
	React.createContext<VisualModePropStatusesSubscription>({
		subscribe: () => () => undefined,
		getSnapshot: () => null,
	});

const defaultVisualModeDragOverrides: VisualModeDragOverrides = {
	getDragOverrides: () => {
		throw new Error('VisualModeDragOverridesContext not initialized');
	},
	getEffectDragOverrides: () => {
		throw new Error('VisualModeDragOverridesContext not initialized');
	},
};

export const VisualModeDragOverridesContext =
	React.createContext<VisualModeDragOverrides>(defaultVisualModeDragOverrides);

export const VisualModeDragOverridesRefContext = React.createContext<
	React.RefObject<VisualModeDragOverrides>
>({current: defaultVisualModeDragOverrides});

const useVisualModeSnapshot = <T,>(
	subscribe: (listener: () => void) => () => void,
	getSnapshot: () => T,
): T => {
	const dormant = useContext(SequenceActivityDormantContext);
	const [, forceUpdate] = useState(0);
	const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	useCommitEffect(() => {
		if (!dormant) {
			return;
		}

		// Activity disconnects passive subscriptions, including useSyncExternalStore.
		// Insertion effects stay connected through nested hidden Activities.
		return subscribe(() => forceUpdate((current) => current + 1));
	}, [dormant, subscribe]);
	return snapshot;
};

export const useDragOverridesForNodePath = (
	nodePath: SequencePropsSubscriptionKey | null,
): Record<string, DragOverrideValue> => {
	const subscription = useContext(VisualModeDragOverridesSubscriptionContext);
	const manager = useContext(SequenceManagerActionsContext);
	const scopedSubscription =
		subscription?.manager === manager ? subscription : null;
	const key =
		nodePath === null ? null : makeSequencePropsSubscriptionKey(nodePath);
	const subscribe = useCallback(
		(listener: () => void) =>
			scopedSubscription?.subscribe(key, listener) ?? (() => undefined),
		[key, scopedSubscription],
	);
	const getSnapshot = useCallback(
		() => scopedSubscription?.getSnapshot(key) ?? emptyDragOverrides,
		[key, scopedSubscription],
	);
	return useVisualModeSnapshot(subscribe, getSnapshot);
};

// Every visual element reads its own status. Subscribing to the whole map would
// rerender all of them whenever any status in the project changes.
export const usePropStatusForNodePath = (
	nodePath: SequencePropsSubscriptionKey | null,
): CanUpdateSequencePropsResponse | null => {
	const subscription = useContext(VisualModePropStatusesSubscriptionContext);
	const key =
		nodePath === null ? null : makeSequencePropsSubscriptionKey(nodePath);
	const subscribe = useCallback(
		(listener: () => void) => subscription.subscribe(key, listener),
		[key, subscription],
	);
	const getSnapshot = useCallback(
		() => subscription.getSnapshot(key),
		[key, subscription],
	);
	return useVisualModeSnapshot(subscribe, getSnapshot);
};

export const useActiveFromDragOverrideKeys = (): ReadonlySet<string> => {
	const snapshot = useContext(ActiveFromDragOverrideKeysContext);
	const manager = useContext(SequenceManagerActionsContext);
	return snapshot?.manager === manager ? snapshot.keys : emptyFromOverrideKeys;
};

export const useEffectDragOverridesForNodePath = (
	nodePath: SequencePropsSubscriptionKey | null,
): Record<string, Record<string, DragOverrideValue>> => {
	const subscription = useContext(VisualModeDragOverridesSubscriptionContext);
	const manager = useContext(SequenceManagerActionsContext);
	const scopedSubscription =
		subscription?.manager === manager ? subscription : null;
	const key =
		nodePath === null ? null : makeSequencePropsSubscriptionKey(nodePath);
	const subscribe = useCallback(
		(listener: () => void) =>
			scopedSubscription?.subscribeEffects(key, listener) ?? (() => undefined),
		[key, scopedSubscription],
	);
	const getSnapshot = useCallback(
		() =>
			scopedSubscription?.getEffectSnapshot(key) ?? emptyEffectDragOverrides,
		[key, scopedSubscription],
	);
	return useVisualModeSnapshot(subscribe, getSnapshot);
};

export const VisualModeSettersContext = React.createContext<VisualModeSetters>({
	setDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	updateDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	updateDragOverridesBatch: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	remapDragOverrideFields: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	clearDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	setEffectDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	updateEffectDragOverridesBatch: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	remapEffectDragOverrideFields: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	clearEffectDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	setPropStatuses: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	setPropStatusesBatch: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	remapPropStatuses: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
});

export const VisualModeBatchSettersContext =
	React.createContext<VisualModeBatchSetters | null>(null);

export type SequencePropsSubscriptionKey = {
	absolutePath: string;
	nodePath: SequenceNodePath;
	sequenceKeys: string[];
	effectKeys: string[][];
	/** Evaluation context of a rendered instance. Never part of source identity. */
	videoConfigValues: VideoConfigValues | null;
};

export type {VideoConfigValues} from './video-config.js';

const effectDragOverridesKey = (
	nodePath: SequencePropsSubscriptionKey,
	effectIndex: number,
): string =>
	`${makeSequencePropsSubscriptionKey(nodePath)}.effects.${effectIndex}`;

export const SequenceManagerProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [dragOverrideState, setDragOverrideState] = useState(() => ({
		overrides: {} as DragOverrides,
		fromKeys: new Set<string>(),
	}));
	const dragOverrides = dragOverrideState.overrides;
	const dragOverridesStore = useRef({
		snapshot: dragOverrides,
		listeners: new Map<string, Set<() => void>>(),
	});
	const [effectDragOverridesState, setEffectDragOverridesState] =
		useState<EffectDragOverrides>({});
	const effectDragOverridesStore = useRef({
		snapshot: effectDragOverridesState,
		byNode: new Map<
			string,
			Record<string, Record<string, DragOverrideValue>>
		>(),
		listeners: new Map<string, Set<() => void>>(),
	});
	const [propStatuses, setPropStatusesMapState] = useState<PropStatuses>({});
	const propStatusesRef = useRef(propStatuses);
	// Elements read their own status from the latest requested map, so one that
	// rerenders together with a status update never renders the previous status.
	// The layout effect wakes up the elements that did not rerender.
	const requestedPropStatusesRef = useRef(propStatuses);
	const propStatusListeners = useRef(new Map<string, Set<() => void>>());
	useIsomorphicLayoutEffect(() => {
		const previous = propStatusesRef.current;
		propStatusesRef.current = propStatuses;
		for (const [key, listeners] of propStatusListeners.current) {
			if (previous[key] !== propStatuses[key]) {
				for (const listener of listeners) {
					listener();
				}
			}
		}
	}, [propStatuses]);

	const setDragOverridesBatch = useCallback(
		(
			overrides: readonly {
				readonly nodePath: SequencePropsSubscriptionKey;
				readonly key: string;
				readonly value: DragOverrideValue;
			}[],
		) => {
			setDragOverrideState((prevState) => {
				const prev = prevState.overrides;
				let next: DragOverrides | null = null;
				let nextFromKeys = prevState.fromKeys;
				for (const {nodePath, key, value} of overrides) {
					const mapKey = makeSequencePropsSubscriptionKey(nodePath);
					const existing = (next ?? prev)[mapKey]?.[key];
					if (
						existing === value ||
						(existing?.type === 'static' &&
							value.type === 'static' &&
							Object.is(existing.value, value.value))
					) {
						continue;
					}

					if (next === null) {
						next = {...prev};
					}

					if (next[mapKey] === prev[mapKey]) {
						next[mapKey] = {...prev[mapKey]};
					}

					next[mapKey][key] = value;
					if (key === 'from' && !nextFromKeys.has(mapKey)) {
						nextFromKeys = new Set(nextFromKeys);
						nextFromKeys.add(mapKey);
					}
				}

				return next === null
					? prevState
					: {overrides: next, fromKeys: nextFromKeys};
			});
		},
		[],
	);

	const setDragOverrides = useCallback(
		(
			nodePath: SequencePropsSubscriptionKey,
			key: string,
			value: DragOverrideValue,
		) => setDragOverridesBatch([{nodePath, key, value}]),
		[setDragOverridesBatch],
	);

	const updateDragOverridesBatch = useCallback<
		VisualModeSetters['updateDragOverridesBatch']
	>((updates) => {
		if (updates.length === 0) return;
		setDragOverrideState((previous) => {
			let {overrides, fromKeys} = previous;
			for (const {nodePath, update} of updates) {
				const key = makeSequencePropsSubscriptionKey(nodePath);
				const current = overrides[key] ?? emptyDragOverrides;
				const updated = update(current);
				if (updated === current) continue;

				const hasOverrides = Object.keys(updated).length > 0;
				if (!hasOverrides && overrides[key] === undefined) continue;

				if (overrides === previous.overrides) overrides = {...overrides};
				if (hasOverrides) {
					overrides[key] = updated;
				} else {
					delete overrides[key];
				}

				const hasFrom = updated.from !== undefined;
				if (fromKeys.has(key) !== hasFrom) {
					if (fromKeys === previous.fromKeys) fromKeys = new Set(fromKeys);
					if (hasFrom) {
						fromKeys.add(key);
					} else {
						fromKeys.delete(key);
					}
				}
			}

			return overrides === previous.overrides
				? previous
				: {overrides, fromKeys};
		});
	}, []);

	const updateDragOverrides = useCallback<
		VisualModeSetters['updateDragOverrides']
	>(
		(nodePath, update) => updateDragOverridesBatch([{nodePath, update}]),
		[updateDragOverridesBatch],
	);

	const remapDragOverrideFields = useCallback<
		VisualModeSetters['remapDragOverrideFields']
	>((remappings) => {
		setDragOverrideState((previous) => {
			const moves = remappings.flatMap((remapping) => {
				const previousKey = makeSequencePropsSubscriptionKey(
					remapping.previousNodePath,
				);
				const key = remapping.nodePath
					? makeSequencePropsSubscriptionKey(remapping.nodePath)
					: null;
				if (previousKey === key) {
					return [];
				}

				const fields = Object.entries(remapping.fields).filter(
					([field, expected]) =>
						previous.overrides[previousKey]?.[field] === expected,
				);
				return fields.length > 0 ? [{previousKey, key, fields}] : [];
			});
			if (moves.length === 0) {
				return previous;
			}

			const overrides = {...previous.overrides};
			const changedKeys = new Set<string>();
			const getMutableFields = (key: string) => {
				if (!changedKeys.has(key)) {
					changedKeys.add(key);
					overrides[key] = {...overrides[key]};
				}

				return overrides[key];
			};

			// Match against one snapshot and remove all sources before applying
			// destinations, so swapping source locations cannot overwrite a preview.
			for (const {previousKey, fields} of moves) {
				const source = getMutableFields(previousKey);
				for (const [field] of fields) {
					delete source[field];
				}
			}

			for (const {key, fields} of moves) {
				if (key === null) {
					continue;
				}

				for (const [field, value] of fields) {
					// A value that did not participate in this remapping has a
					// different owner. Leave that newer preview in place.
					if (overrides[key]?.[field] !== undefined) {
						continue;
					}

					getMutableFields(key)[field] = value;
				}
			}

			let {fromKeys} = previous;
			for (const key of changedKeys) {
				const hasFrom = overrides[key].from !== undefined;
				if (Object.keys(overrides[key]).length === 0) {
					delete overrides[key];
				}

				if (fromKeys.has(key) === hasFrom) {
					continue;
				}

				if (fromKeys === previous.fromKeys) {
					fromKeys = new Set(fromKeys);
				}

				if (hasFrom) {
					fromKeys.add(key);
				} else {
					fromKeys.delete(key);
				}
			}

			return {overrides, fromKeys};
		});
	}, []);

	const subscribeDragOverrides = useCallback(
		(key: string | null, listener: () => void) => {
			if (key === null) {
				return () => undefined;
			}

			let listeners = dragOverridesStore.current.listeners.get(key);
			if (!listeners) {
				listeners = new Set();
				dragOverridesStore.current.listeners.set(key, listeners);
			}

			listeners.add(listener);
			return () => {
				listeners.delete(listener);
				if (listeners.size === 0) {
					dragOverridesStore.current.listeners.delete(key);
				}
			};
		},
		[],
	);
	const getDragOverridesSnapshot = useCallback((key: string | null) => {
		return key === null
			? emptyDragOverrides
			: (dragOverridesStore.current.snapshot[key] ?? emptyDragOverrides);
	}, []);
	useIsomorphicLayoutEffect(() => {
		const previous = dragOverridesStore.current.snapshot;
		dragOverridesStore.current.snapshot = dragOverrides;
		for (const key of new Set([
			...Object.keys(previous),
			...Object.keys(dragOverrides),
		])) {
			if (previous[key] !== dragOverrides[key]) {
				for (const listener of dragOverridesStore.current.listeners.get(key) ??
					[]) {
					listener();
				}
			}
		}
	}, [dragOverrides]);
	const subscribeEffectDragOverrides = useCallback(
		(key: string | null, listener: () => void) => {
			if (key === null) {
				return () => undefined;
			}

			let listeners = effectDragOverridesStore.current.listeners.get(key);
			if (!listeners) {
				listeners = new Set();
				effectDragOverridesStore.current.listeners.set(key, listeners);
			}

			listeners.add(listener);
			return () => {
				listeners.delete(listener);
				if (listeners.size === 0) {
					effectDragOverridesStore.current.listeners.delete(key);
				}
			};
		},
		[],
	);
	const getEffectDragOverridesSnapshot = useCallback((key: string | null) => {
		return key === null
			? emptyEffectDragOverrides
			: (effectDragOverridesStore.current.byNode.get(key) ??
					emptyEffectDragOverrides);
	}, []);
	useIsomorphicLayoutEffect(() => {
		const previous = effectDragOverridesStore.current.snapshot;
		const byNode = new Map(effectDragOverridesStore.current.byNode);
		const changedNodes = new Set<string>();
		for (const flatKey of new Set([
			...Object.keys(previous),
			...Object.keys(effectDragOverridesState),
		])) {
			if (previous[flatKey] === effectDragOverridesState[flatKey]) {
				continue;
			}

			const separator = flatKey.lastIndexOf('.effects.');
			if (separator === -1) {
				throw new Error('Invalid effect drag override key');
			}

			const nodeKey = flatKey.slice(0, separator);
			const effectIndex = flatKey.slice(separator + '.effects.'.length);
			if (!changedNodes.has(nodeKey)) {
				byNode.set(nodeKey, {...byNode.get(nodeKey)});
				changedNodes.add(nodeKey);
			}

			const next = byNode.get(nodeKey)!;
			if (effectDragOverridesState[flatKey] === undefined) {
				delete next[effectIndex];
			} else {
				next[effectIndex] = effectDragOverridesState[flatKey];
			}
		}

		for (const nodeKey of changedNodes) {
			if (Object.keys(byNode.get(nodeKey)!).length === 0) {
				byNode.delete(nodeKey);
			}
		}

		effectDragOverridesStore.current.snapshot = effectDragOverridesState;
		effectDragOverridesStore.current.byNode = byNode;
		for (const nodeKey of changedNodes) {
			for (const listener of effectDragOverridesStore.current.listeners.get(
				nodeKey,
			) ?? []) {
				listener();
			}
		}
	}, [effectDragOverridesState]);

	const clearDragOverrides = useCallback(
		(nodePath: SequencePropsSubscriptionKey) => {
			setDragOverrideState((prevState) => {
				const prev = prevState.overrides;
				const key = makeSequencePropsSubscriptionKey(nodePath);
				if (!prev[key]) {
					return prevState;
				}

				const next = {...prev};
				delete next[key];
				const nextFromKeys = prevState.fromKeys.has(key)
					? new Set(prevState.fromKeys)
					: prevState.fromKeys;
				nextFromKeys.delete(key);
				return {overrides: next, fromKeys: nextFromKeys};
			});
		},
		[],
	);

	const setEffectDragOverridesBatch = useCallback(
		(
			overrides: readonly {
				readonly nodePath: SequencePropsSubscriptionKey;
				readonly effectIndex: number;
				readonly key: string;
				readonly value: DragOverrideValue;
			}[],
		) => {
			setEffectDragOverridesState((prev) => {
				let next: EffectDragOverrides | null = null;
				for (const {nodePath, effectIndex, key, value} of overrides) {
					const mapKey = effectDragOverridesKey(nodePath, effectIndex);
					const existing = (next ?? prev)[mapKey]?.[key];
					if (
						existing === value ||
						(existing?.type === 'static' &&
							value.type === 'static' &&
							Object.is(existing.value, value.value))
					) {
						continue;
					}

					if (next === null) {
						next = {...prev};
					}

					if (next[mapKey] === prev[mapKey]) {
						next[mapKey] = {...prev[mapKey]};
					}

					next[mapKey][key] = value;
				}

				return next ?? prev;
			});
		},
		[],
	);
	const setEffectDragOverrides = useCallback(
		(
			nodePath: SequencePropsSubscriptionKey,
			effectIndex: number,
			key: string,
			value: DragOverrideValue,
		) => setEffectDragOverridesBatch([{nodePath, effectIndex, key, value}]),
		[setEffectDragOverridesBatch],
	);

	const updateEffectDragOverridesBatch = useCallback<
		VisualModeSetters['updateEffectDragOverridesBatch']
	>((updates) => {
		if (updates.length === 0) return;
		setEffectDragOverridesState((previous) => {
			let next = previous;
			for (const {nodePath, effectIndex, update} of updates) {
				const key = effectDragOverridesKey(nodePath, effectIndex);
				const current = next[key] ?? emptyDragOverrides;
				const updated = update(current);
				if (updated === current) continue;

				const hasOverrides = Object.keys(updated).length > 0;
				if (!hasOverrides && next[key] === undefined) continue;

				if (next === previous) next = {...previous};
				if (hasOverrides) next[key] = updated;
				else delete next[key];
			}

			return next;
		});
	}, []);

	const remapEffectDragOverrideFields = useCallback<
		VisualModeSetters['remapEffectDragOverrideFields']
	>((remappings) => {
		setEffectDragOverridesState((previous) => {
			const moves = remappings.flatMap((remapping) => {
				const previousKey = effectDragOverridesKey(
					remapping.previousNodePath,
					remapping.effectIndex,
				);
				const key = remapping.nodePath
					? effectDragOverridesKey(remapping.nodePath, remapping.effectIndex)
					: null;
				if (previousKey === key) return [];

				const fields = Object.entries(remapping.fields).filter(
					([field, expected]) => previous[previousKey]?.[field] === expected,
				);
				return fields.length > 0 ? [{previousKey, key, fields}] : [];
			});
			if (moves.length === 0) return previous;

			const next = {...previous};
			const changedKeys = new Set<string>();
			const getMutableFields = (key: string) => {
				if (!changedKeys.has(key)) {
					changedKeys.add(key);
					next[key] = {...next[key]};
				}

				return next[key];
			};

			// Match against the original snapshot and remove all participating fields
			// first, so a source-path swap keeps both owners' previews intact.
			for (const {previousKey, fields} of moves) {
				const source = getMutableFields(previousKey);
				for (const [field] of fields) delete source[field];
			}

			for (const {key, fields} of moves) {
				if (key === null) continue;
				for (const [field, value] of fields) {
					// Preserve a newer, nonparticipating destination owner.
					if (next[key]?.[field] !== undefined) continue;
					getMutableFields(key)[field] = value;
				}
			}

			for (const key of changedKeys) {
				if (Object.keys(next[key]).length === 0) delete next[key];
			}

			return next;
		});
	}, []);

	const clearEffectDragOverrides = useCallback(
		(nodePath: SequencePropsSubscriptionKey, effectIndex: number) => {
			setEffectDragOverridesState((prev) => {
				const mapKey = effectDragOverridesKey(nodePath, effectIndex);
				if (!prev[mapKey]) {
					return prev;
				}

				const next = {...prev};
				delete next[mapKey];
				return next;
			});
		},
		[],
	);

	const updatePropStatuses = useCallback(
		(update: (prev: PropStatuses) => PropStatuses) => {
			const previous = requestedPropStatusesRef.current;
			const next = update(previous);
			if (next === previous) {
				return;
			}

			requestedPropStatusesRef.current = next;
			setPropStatusesMapState(next);
		},
		[],
	);
	const setPropStatusesBatch = useCallback<
		VisualModeSetters['setPropStatusesBatch']
	>(
		(updates) => {
			if (updates.length === 0) return;
			updatePropStatuses((previous) => {
				let next = previous;
				for (const {nodePath, update} of updates) {
					const key = makeSequencePropsSubscriptionKey(nodePath);
					const current = next[key];
					const updated = update(current);
					if (updated === current) continue;

					if (next === previous) next = {...previous};
					next[key] = updated;
				}

				return next;
			});
		},
		[updatePropStatuses],
	);
	const setPropStatuses = useCallback<VisualModeSetters['setPropStatuses']>(
		(nodePath, update) => setPropStatusesBatch([{nodePath, update}]),
		[setPropStatusesBatch],
	);
	const remapPropStatuses = useCallback(
		(remappings: readonly SequencePropsStatusRemapping[]) => {
			updatePropStatuses((prev) => {
				const next = {...prev};
				for (const remapping of remappings) {
					delete next[
						makeSequencePropsSubscriptionKey(remapping.previousNodePath)
					];
				}

				for (const remapping of remappings) {
					if (remapping.nodePath !== null && remapping.result !== null) {
						next[makeSequencePropsSubscriptionKey(remapping.nodePath)] =
							remapping.result;
					}
				}

				return next;
			});
		},
		[updatePropStatuses],
	);

	const dragOverridesSubscription = useMemo<
		Omit<DragOverridesSubscription, 'manager'>
	>(
		() => ({
			subscribe: subscribeDragOverrides,
			getSnapshot: getDragOverridesSnapshot,
			subscribeEffects: subscribeEffectDragOverrides,
			getEffectSnapshot: getEffectDragOverridesSnapshot,
		}),
		[
			getDragOverridesSnapshot,
			getEffectDragOverridesSnapshot,
			subscribeDragOverrides,
			subscribeEffectDragOverrides,
		],
	);

	const getDragOverrides = useCallback(
		(nodePath: SequencePropsSubscriptionKey) => {
			return dragOverrides[makeSequencePropsSubscriptionKey(nodePath)] ?? {};
		},
		[dragOverrides],
	);

	const getEffectDragOverrides = useCallback(
		(nodePath: SequencePropsSubscriptionKey, effectIndex: number) => {
			return (
				effectDragOverridesState[
					effectDragOverridesKey(nodePath, effectIndex)
				] ?? {}
			);
		},
		[effectDragOverridesState],
	);

	const propStatusesContext: VisualModePropStatuses = useMemo(() => {
		return {
			propStatuses,
		};
	}, [propStatuses]);
	const propStatusesSubscription = useMemo<VisualModePropStatusesSubscription>(
		() => ({
			subscribe: (key, listener) => {
				if (key === null) {
					return () => undefined;
				}

				let listeners = propStatusListeners.current.get(key);
				if (!listeners) {
					listeners = new Set();
					propStatusListeners.current.set(key, listeners);
				}

				listeners.add(listener);
				return () => {
					listeners.delete(listener);
					if (listeners.size === 0) {
						propStatusListeners.current.delete(key);
					}
				};
			},
			getSnapshot: (key) =>
				key === null ? null : (requestedPropStatusesRef.current[key] ?? null),
		}),
		[],
	);

	const dragOverridesContext: VisualModeDragOverrides = useMemo(() => {
		return {
			getDragOverrides,
			getEffectDragOverrides,
		};
	}, [getDragOverrides, getEffectDragOverrides]);
	const dragOverridesRef = useRef(dragOverridesContext);
	useIsomorphicLayoutEffect(() => {
		// Interaction handlers read the latest committed overrides without subscribing.
		dragOverridesRef.current = dragOverridesContext;
	}, [dragOverridesContext]);

	const settersContext: VisualModeSetters = useMemo(() => {
		return {
			setDragOverrides,
			updateDragOverrides,
			updateDragOverridesBatch,
			remapDragOverrideFields,
			clearDragOverrides,
			setEffectDragOverrides,
			updateEffectDragOverridesBatch,
			remapEffectDragOverrideFields,
			clearEffectDragOverrides,
			setPropStatuses,
			setPropStatusesBatch,
			remapPropStatuses,
		};
	}, [
		setDragOverrides,
		updateDragOverrides,
		updateDragOverridesBatch,
		remapDragOverrideFields,
		clearDragOverrides,
		setEffectDragOverrides,
		updateEffectDragOverridesBatch,
		remapEffectDragOverrideFields,
		clearEffectDragOverrides,
		setPropStatuses,
		setPropStatusesBatch,
		remapPropStatuses,
	]);
	const batchSettersContext = useMemo<VisualModeBatchSetters>(
		() => ({setDragOverridesBatch, setEffectDragOverridesBatch}),
		[setDragOverridesBatch, setEffectDragOverridesBatch],
	);

	return (
		<SequenceRegistryProvider>
			<VisualModePropStatusesRefContext.Provider value={propStatusesRef}>
				<VisualModePropStatusesSubscriptionContext.Provider
					value={propStatusesSubscription}
				>
					<VisualModePropStatusesContext.Provider value={propStatusesContext}>
						<SequenceManagerScopeProviders
							dragOverridesSubscription={dragOverridesSubscription}
							fromKeys={dragOverrideState.fromKeys}
						>
							<VisualModeDragOverridesContext.Provider
								value={dragOverridesContext}
							>
								<VisualModeDragOverridesRefContext.Provider
									value={dragOverridesRef}
								>
									<VisualModeSettersContext.Provider value={settersContext}>
										<VisualModeBatchSettersContext.Provider
											value={batchSettersContext}
										>
											{children}
										</VisualModeBatchSettersContext.Provider>
									</VisualModeSettersContext.Provider>
								</VisualModeDragOverridesRefContext.Provider>
							</VisualModeDragOverridesContext.Provider>
						</SequenceManagerScopeProviders>
					</VisualModePropStatusesContext.Provider>
				</VisualModePropStatusesSubscriptionContext.Provider>
			</VisualModePropStatusesRefContext.Provider>
		</SequenceRegistryProvider>
	);
};
