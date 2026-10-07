import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {
	COMMIT_ORDER_EVENT,
	COMMIT_REGISTRATION_ERROR_EVENT,
	isCommitRegistrationObserverInstalled,
	withCommittedMetadata,
	type CommittedMetadata,
	type CommitOrderEventDetail,
	type CommittedSequenceSnapshot,
} from './committed-metadata.js';
import type {TSequence} from './CompositionManager.js';
import {
	areRegistryEntriesEqual,
	createRegistryStore,
	reconcileRegistryEntries,
	type RegistryStore,
} from './registry-store.js';
import {SequenceActivityContext} from './sequence-activity-context.js';
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

type SequenceManagerActions = {
	registerSequence: (seq: TSequence) => void;
	updateSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
};

export type SequenceManagerRef = {
	current: TSequence[];
};

export type SequenceNodePath = Array<string | number>;

const defaultSequenceManagerActions: SequenceManagerActions = {
	registerSequence: () => {
		throw new Error('SequenceManagerActionsContext not initialized');
	},
	updateSequence: () => {
		throw new Error('SequenceManagerActionsContext not initialized');
	},
	unregisterSequence: () => {
		throw new Error('SequenceManagerActionsContext not initialized');
	},
};

export const SequenceManagerActionsContext = React.createContext(
	defaultSequenceManagerActions,
);

export const SequenceRegistryContext = React.createContext<RegistryStore<
	TSequence[]
> | null>(null);
const subscribeToNoRegistry = () => () => undefined;
const emptySequences: TSequence[] = [];
const getEmptySequences = () => emptySequences;
export const SequenceCommitRegistrationContext = React.createContext(false);
export const SequenceRegistryScopeContext = React.createContext<{
	readonly commitRegistrationRequested: boolean;
	readonly onCommitSequences: (
		scopeId: string,
		sequences: readonly TSequence[],
		sequenceIds: readonly string[],
	) => void;
} | null>(null);
export const useSequenceManagerSequences = (): TSequence[] => {
	const registry = useContext(SequenceRegistryContext);
	return useSyncExternalStore(
		registry?.subscribe ?? subscribeToNoRegistry,
		registry?.getSnapshot ?? getEmptySequences,
		registry?.getSnapshot ?? getEmptySequences,
	);
};

export const SequenceManagerRefContext =
	React.createContext<SequenceManagerRef>({
		current: [],
	});
const SequenceManagerRefProvider = withCommittedMetadata(
	SequenceManagerRefContext.Provider,
);

export const SequenceRegistrationContext = React.createContext(false);

export const DisableSequenceRegistrationContext = React.createContext(false);

export const DisableSequenceRegistrationProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return React.createElement(
		DisableSequenceRegistrationContext.Provider,
		{value: true},
		children,
	);
};

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
				{children}
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
	clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	setEffectDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		effectIndex: number,
		key: string,
		value: DragOverrideValue,
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

export const VisualModeDragOverridesContext =
	React.createContext<VisualModeDragOverrides>({
		getDragOverrides: () => {
			throw new Error('VisualModeDragOverridesContext not initialized');
		},
		getEffectDragOverrides: () => {
			throw new Error('VisualModeDragOverridesContext not initialized');
		},
	});

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
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
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
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const VisualModeSettersContext = React.createContext<VisualModeSetters>({
	setDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	clearDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	setEffectDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	clearEffectDragOverrides: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
	setPropStatuses: () => {
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
	const {isStudio} = useRemotionEnvironment();
	const [activityRequested] = useState(
		() =>
			isStudio &&
			typeof window !== 'undefined' &&
			(new URLSearchParams(window.location.search).get(
				'experimentalSequenceActivity',
			) === 'true' ||
				localStorage.getItem('remotion.experimentalSequenceActivity') ===
					'true'),
	);

	const sequenceRegistrationEnabled = useContext(SequenceRegistrationContext);
	const shouldObserveCommits = isStudio || sequenceRegistrationEnabled;
	const [sequenceManagerId] = useState(() => String(Math.random()));
	const [commitRegistrationEnabled, setCommitRegistrationEnabled] = useState(
		() => shouldObserveCommits && isCommitRegistrationObserverInstalled(),
	);
	const observedCommitRef = useRef(false);
	const rootObservationFailedRef = useRef(false);
	const committedRegistrationIdsRef = useRef<ReadonlySet<string>>(new Set());
	const committedDescriptorsRef = useRef<ReadonlyMap<string, TSequence>>(
		new Map(),
	);
	const pendingCommittedSequencesRef = useRef(
		new Map<string, CommittedSequenceSnapshot>(),
	);
	const committedScopesRef = useRef(
		new Map<string, CommittedSequenceSnapshot>([
			[sequenceManagerId, {sequences: [], sequenceIds: []}],
		]),
	);
	const registrationObserverFailedRef = useRef(false);
	const registrationUnmountedRef = useRef(false);
	const committedOrderRef = useRef<ReadonlyMap<string, number> | null>(null);
	const committedOrderIdsRef = useRef<readonly string[] | null>(null);
	const [registry] = useState(() => createRegistryStore<TSequence[]>([]));
	const setSequences = registry.setSnapshot;
	const sequencesRef = useMemo<SequenceManagerRef>(
		() => ({
			get current() {
				return registry.getSnapshot();
			},
		}),
		[registry],
	);
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
	useIsomorphicLayoutEffect(() => {
		propStatusesRef.current = propStatuses;
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

	const setPropStatuses = useCallback(
		(
			nodePath: SequencePropsSubscriptionKey,
			values: (
				prev: CanUpdateSequencePropsResponse,
			) => CanUpdateSequencePropsResponse,
		) => {
			setPropStatusesMapState((prev) => {
				const key = makeSequencePropsSubscriptionKey(nodePath);

				const prevKey = prev[key];
				const newKey = values(prevKey);

				if (prevKey === newKey) {
					return prev;
				}

				return {...prev, [key]: newKey};
			});
		},
		[],
	);
	const remapPropStatuses = useCallback(
		(remappings: readonly SequencePropsStatusRemapping[]) => {
			setPropStatusesMapState((prev) => {
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
		[],
	);

	const onCommitSequences = useCallback(
		(
			scopeId: string,
			snapshot: readonly TSequence[],
			sequenceIds: readonly string[],
		) => {
			if (
				registrationObserverFailedRef.current ||
				registrationUnmountedRef.current
			) {
				return;
			}

			const previousSnapshot =
				pendingCommittedSequencesRef.current.get(scopeId) ??
				committedScopesRef.current.get(scopeId);
			if (
				previousSnapshot?.sequences === snapshot &&
				previousSnapshot.sequenceIds === sequenceIds
			) {
				return;
			}

			const alreadyPending = pendingCommittedSequencesRef.current.size > 0;
			pendingCommittedSequencesRef.current.set(scopeId, {
				sequences: snapshot,
				sequenceIds,
			});
			if (alreadyPending) {
				return;
			}

			// Publish after React finishes committing, and coalesce successive snapshots.
			queueMicrotask(() => {
				const pending = pendingCommittedSequencesRef.current;
				pendingCommittedSequencesRef.current = new Map();
				if (
					pending.size === 0 ||
					registrationObserverFailedRef.current ||
					registrationUnmountedRef.current
				) {
					return;
				}

				const previousIds = committedRegistrationIdsRef.current;
				const previousDescriptors = committedDescriptorsRef.current;
				for (const [id, scope] of pending) {
					if (id !== sequenceManagerId && scope.sequenceIds.length === 0) {
						committedScopesRef.current.delete(id);
					} else {
						committedScopesRef.current.set(id, scope);
					}
				}

				// A forwarded renderer owns only its fragment. Publishing or removing it
				// must never replace the descriptors committed by the other roots.
				const scopes = [...committedScopesRef.current.values()];
				const sequences = scopes.flatMap((scope) => scope.sequences);
				const ids = scopes.flatMap((scope) => scope.sequenceIds);
				committedDescriptorsRef.current = new Map(
					sequences.map((sequence) => [sequence.id, sequence]),
				);
				const nextIds = new Set(sequences.map((sequence) => sequence.id));
				const order = new Map(ids.map((id, index) => [id, index]));
				committedOrderIdsRef.current = ids;
				committedOrderRef.current = order;
				committedRegistrationIdsRef.current = nextIds;
				setSequences((current) =>
					reconcileRegistryEntries({
						current,
						entries: sequences,
						previousDescriptors,
						previousKeys: previousIds,
						nextKeys: nextIds,
						getKey: (sequence) => sequence.id,
						order,
						orderProperty: 'timelineOrder',
					}),
				);
			});
		},
		[sequenceManagerId, setSequences],
	);
	const onCommitRootSequences = useCallback(
		(sequences: readonly TSequence[], sequenceIds: readonly string[]) => {
			if (!rootObservationFailedRef.current) {
				observedCommitRef.current = true;
				onCommitSequences(sequenceManagerId, sequences, sequenceIds);
			}
		},
		[onCommitSequences, sequenceManagerId],
	);
	const registryScope = useMemo(
		() => ({
			onCommitSequences,
			commitRegistrationRequested: shouldObserveCommits,
		}),
		[onCommitSequences, shouldObserveCommits],
	);

	useIsomorphicLayoutEffect(() => {
		if (!shouldObserveCommits) {
			return;
		}

		let unmounted = false;
		registrationUnmountedRef.current = false;
		const onRegistrationError = () => {
			if (registrationObserverFailedRef.current) {
				return;
			}

			registrationObserverFailedRef.current = true;
			pendingCommittedSequencesRef.current.clear();
			queueMicrotask(() => {
				if (registrationUnmountedRef.current) {
					return;
				}

				const previousIds = committedRegistrationIdsRef.current;
				committedRegistrationIdsRef.current = new Set();
				committedScopesRef.current.clear();
				setSequences((current) =>
					current.filter((sequence) => !previousIds.has(sequence.id)),
				);
				setCommitRegistrationEnabled(false);
			});
		};

		const onCommitOrder = (event: Event) => {
			const {detail} = event as CustomEvent<CommitOrderEventDetail>;
			const managerOrder = detail.sequenceManagers.find(
				(item) => item.managerId === sequenceManagerId,
			);
			if (!managerOrder) {
				return;
			}

			if (commitRegistrationEnabled) {
				return;
			}

			const previousOrder = committedOrderIdsRef.current;
			if (
				previousOrder === managerOrder.sequenceIds ||
				(previousOrder !== null &&
					previousOrder.length === managerOrder.sequenceIds.length &&
					previousOrder.every(
						(sequenceId, index) =>
							sequenceId === managerOrder.sequenceIds[index],
					))
			) {
				return;
			}

			const order = new Map(
				managerOrder.sequenceIds.map((sequenceId, index) => [
					sequenceId,
					index,
				]),
			);
			committedOrderIdsRef.current = managerOrder.sequenceIds;
			committedOrderRef.current = order;
			queueMicrotask(() => {
				if (unmounted) {
					return;
				}

				setSequences((currentSequences) => {
					let changed = false;
					const nextSequences = currentSequences.map((sequence) => {
						const timelineOrder = order.get(sequence.id) ?? null;
						if (sequence.timelineOrder === timelineOrder) {
							return sequence;
						}

						changed = true;
						return {...sequence, timelineOrder};
					});

					return changed ? nextSequences : currentSequences;
				});
			});
		};

		window.addEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
		window.addEventListener(
			COMMIT_REGISTRATION_ERROR_EVENT,
			onRegistrationError,
		);
		if (commitRegistrationEnabled) {
			// React invokes its commit hook after layout effects. Installation alone
			// does not prove this renderer connected to the hook during initialization.
			queueMicrotask(() => {
				if (
					unmounted ||
					observedCommitRef.current ||
					registrationObserverFailedRef.current
				) {
					return;
				}

				rootObservationFailedRef.current = true;
				onCommitSequences(sequenceManagerId, [], []);
				setCommitRegistrationEnabled(false);
			});
		}

		return () => {
			unmounted = true;
			registrationUnmountedRef.current = true;
			// Effect replay must not discard a snapshot already collected by React.
			window.removeEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
			window.removeEventListener(
				COMMIT_REGISTRATION_ERROR_EVENT,
				onRegistrationError,
			);
		};
	}, [
		shouldObserveCommits,
		sequenceManagerId,
		setSequences,
		commitRegistrationEnabled,
		onCommitSequences,
	]);

	const registerSequence = useCallback(
		(seq: TSequence) => {
			setSequences((seqs) => {
				return [
					...seqs,
					{
						...seq,
						timelineOrder: committedOrderRef.current?.get(seq.id) ?? null,
					},
				];
			});
		},
		[setSequences],
	);
	const updateSequence = useCallback(
		(seq: TSequence) => {
			setSequences((seqs) => {
				const index = seqs.findIndex((item) => item.id === seq.id);
				if (index === -1) {
					return seqs;
				}

				const updatedSequence = {
					...seq,
					timelineOrder: committedOrderRef.current?.get(seq.id) ?? null,
				};
				if (areRegistryEntriesEqual(seqs[index], updatedSequence)) {
					return seqs;
				}

				const next = [...seqs];
				next[index] = updatedSequence;
				return next;
			});
		},
		[setSequences],
	);

	const unregisterSequence = useCallback(
		(seq: string) => {
			setSequences((seqs) => seqs.filter((s) => s.id !== seq));
		},
		[setSequences],
	);

	const actions = useMemo<SequenceManagerActions>(() => {
		return {
			registerSequence,
			updateSequence,
			unregisterSequence,
		};
	}, [registerSequence, unregisterSequence, updateSequence]);
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

	const dragOverridesContext: VisualModeDragOverrides = useMemo(() => {
		return {
			getDragOverrides,
			getEffectDragOverrides,
		};
	}, [getDragOverrides, getEffectDragOverrides]);

	const settersContext: VisualModeSetters = useMemo(() => {
		return {
			setDragOverrides,
			clearDragOverrides,
			setEffectDragOverrides,
			clearEffectDragOverrides,
			setPropStatuses,
			remapPropStatuses,
		};
	}, [
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		setPropStatuses,
		remapPropStatuses,
	]);
	const batchSettersContext = useMemo<VisualModeBatchSetters>(
		() => ({setDragOverridesBatch, setEffectDragOverridesBatch}),
		[setDragOverridesBatch, setEffectDragOverridesBatch],
	);

	const metadata = useMemo<CommittedMetadata | null>(
		() =>
			shouldObserveCommits
				? {
						type: 'sequence-manager',
						id: sequenceManagerId,
						onCommit: commitRegistrationEnabled ? onCommitRootSequences : null,
					}
				: null,
		[
			commitRegistrationEnabled,
			onCommitRootSequences,
			sequenceManagerId,
			shouldObserveCommits,
		],
	);
	return (
		<SequenceManagerRefProvider
			value={sequencesRef}
			_remotionCommitMetadata={metadata}
		>
			<SequenceRegistryScopeContext.Provider value={registryScope}>
				<SequenceManagerActionsContext.Provider value={actions}>
					<SequenceRegistryContext.Provider value={registry}>
						<SequenceCommitRegistrationContext.Provider
							value={commitRegistrationEnabled}
						>
							<VisualModePropStatusesRefContext.Provider
								value={propStatusesRef}
							>
								<VisualModePropStatusesContext.Provider
									value={propStatusesContext}
								>
									<SequenceManagerScopeProviders
										dragOverridesSubscription={dragOverridesSubscription}
										fromKeys={dragOverrideState.fromKeys}
									>
										<VisualModeDragOverridesContext.Provider
											value={dragOverridesContext}
										>
											<VisualModeSettersContext.Provider value={settersContext}>
												<VisualModeBatchSettersContext.Provider
													value={batchSettersContext}
												>
													<SequenceActivityContext.Provider
														value={
															activityRequested &&
															isStudio &&
															commitRegistrationEnabled &&
															typeof React.Activity !== 'undefined'
														}
													>
														{children}
													</SequenceActivityContext.Provider>
												</VisualModeBatchSettersContext.Provider>
											</VisualModeSettersContext.Provider>
										</VisualModeDragOverridesContext.Provider>
									</SequenceManagerScopeProviders>
								</VisualModePropStatusesContext.Provider>
							</VisualModePropStatusesRefContext.Provider>
						</SequenceCommitRegistrationContext.Provider>
					</SequenceRegistryContext.Provider>
				</SequenceManagerActionsContext.Provider>
			</SequenceRegistryScopeContext.Provider>
		</SequenceManagerRefProvider>
	);
};
