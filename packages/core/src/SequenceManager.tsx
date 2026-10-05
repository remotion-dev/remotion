import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {TSequence} from './CompositionManager.js';
import {
	COMMIT_ORDER_EVENT,
	SequenceManagerOrderMarker,
	type CommitOrderEventDetail,
} from './sequence-order-marker.js';
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
import {useSyncExternalStore} from './use-sync-external-store.js';
import type {VideoConfigValues} from './video-config.js';

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export type SequenceManagerContext = {
	registerSequence: (seq: TSequence) => void;
	updateSequence: ((seq: TSequence) => void) | null;
	unregisterSequence: (id: string) => void;
	sequences: TSequence[];
};

export type SequenceManagerRef = {
	current: TSequence[];
};

export type SequenceNodePath = Array<string | number>;

const defaultSequenceManager: SequenceManagerContext = {
	registerSequence: () => {
		throw new Error('SequenceManagerContext not initialized');
	},
	updateSequence: null,
	unregisterSequence: () => {
		throw new Error('SequenceManagerContext not initialized');
	},
	sequences: [],
};

type SequenceManagerActions = Pick<
	SequenceManagerContext,
	'registerSequence' | 'updateSequence' | 'unregisterSequence'
>;

export const SequenceManagerActionsContext =
	React.createContext<SequenceManagerActions>({
		registerSequence: defaultSequenceManager.registerSequence,
		updateSequence: defaultSequenceManager.updateSequence,
		unregisterSequence: defaultSequenceManager.unregisterSequence,
	});

export const SequenceManager = React.createContext(defaultSequenceManager);
const NativeSequenceManagerProvider = SequenceManager.Provider;
const SequenceManagerProviderWithActions: React.FC<
	React.ProviderProps<SequenceManagerContext>
> = ({value, children}) => {
	const actions = useMemo<SequenceManagerActions>(
		() => ({
			registerSequence: value.registerSequence,
			updateSequence: value.updateSequence,
			unregisterSequence: value.unregisterSequence,
		}),
		[value.registerSequence, value.updateSequence, value.unregisterSequence],
	);
	return (
		<SequenceManagerActionsContext.Provider value={actions}>
			<NativeSequenceManagerProvider value={value}>
				{children}
			</NativeSequenceManagerProvider>
		</SequenceManagerActionsContext.Provider>
	);
};

// Keep custom SequenceManager.Provider trees in sync with the stable actions
// context while preserving the legacy reactive sequence-list context.
Object.defineProperty(SequenceManager, 'Provider', {
	value: SequenceManagerProviderWithActions,
});

export const useSequenceManagerSequences = (): TSequence[] => {
	return useContext(SequenceManager).sequences;
};

export const SequenceManagerRefContext =
	React.createContext<SequenceManagerRef>({
		current: [],
	});

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

export type CanUpdateEffectPropsResponseTrue = {
	canUpdate: true;
	callee: string;
	importPath: string | null;
	effectIndex: number;
	props: Record<string, CanUpdateSequencePropStatus>;
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

export type CanUpdateEffectPropsResponse =
	| CanUpdateEffectPropsResponseTrue
	| CanUpdateEffectPropsResponseFalse;

export type CanUpdateSequencePropsResponseTrue = {
	canUpdate: true;
	props: Record<string, CanUpdateSequencePropStatus>;
	effects: CanUpdateEffectPropsResponse[];
};

export type CanUpdateSequencePropsResponseFalse = {
	canUpdate: false;
	reason: CannotUpdateSequenceReason;
};

export type CanUpdateSequencePropsResponse =
	| CanUpdateSequencePropsResponseTrue
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

/* eslint-disable react-hooks/rules-of-hooks */
export const useDragOverridesForNodePath = (
	nodePath: SequencePropsSubscriptionKey | null,
): Record<string, DragOverrideValue> => {
	const subscription = useContext(VisualModeDragOverridesSubscriptionContext);
	const manager = useContext(SequenceManagerActionsContext);
	const scopedSubscription =
		subscription?.manager === manager ? subscription : null;
	// Legacy providers only supply VisualModeDragOverridesContext. Its presence is
	// fixed for the lifetime of a mounted tree.
	const legacy =
		scopedSubscription === null
			? useContext(VisualModeDragOverridesContext)
			: null;
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
	const overrides = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	return legacy !== null && nodePath !== null
		? legacy.getDragOverrides(nodePath)
		: overrides;
};

export const useActiveFromDragOverrideKeys = (): ReadonlySet<string> => {
	const snapshot = useContext(ActiveFromDragOverrideKeysContext);
	const manager = useContext(SequenceManagerActionsContext);
	return snapshot?.manager === manager ? snapshot.keys : emptyFromOverrideKeys;
};

export const useEffectDragOverridesForNodePath = (
	nodePath: SequencePropsSubscriptionKey | null,
	effectCount: number,
): Record<string, Record<string, DragOverrideValue>> => {
	const subscription = useContext(VisualModeDragOverridesSubscriptionContext);
	const manager = useContext(SequenceManagerActionsContext);
	const scopedSubscription =
		subscription?.manager === manager ? subscription : null;
	// Legacy providers only supply VisualModeDragOverridesContext. Its presence is
	// fixed for the lifetime of a mounted tree.
	const legacy =
		scopedSubscription === null
			? useContext(VisualModeDragOverridesContext)
			: null;
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
	const overrides = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	if (legacy !== null && nodePath !== null) {
		const legacyOverrides: Record<
			string,
			Record<string, DragOverrideValue>
		> = {};
		for (let index = 0; index < effectCount; index++) {
			legacyOverrides[index] = legacy.getEffectDragOverrides(nodePath, index);
		}

		return legacyOverrides;
	}

	return overrides;
};
/* eslint-enable react-hooks/rules-of-hooks */

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
	const [sequenceManagerId] = useState(() => String(Math.random()));
	const committedOrderRef = useRef<ReadonlyMap<string, number> | null>(null);
	const committedOrderIdsRef = useRef<readonly string[] | null>(null);
	const [sequences, setSequences] = useState<TSequence[]>([]);
	const sequencesRef = useRef(sequences);
	sequencesRef.current = sequences;
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
	propStatusesRef.current = propStatuses;

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

	useIsomorphicLayoutEffect(() => {
		if (!isStudio) {
			return;
		}

		let unmounted = false;
		const onCommitOrder = (event: Event) => {
			const {detail} = event as CustomEvent<CommitOrderEventDetail>;
			const managerOrder = detail.sequenceManagers.find(
				(item) => item.managerId === sequenceManagerId,
			);
			if (!managerOrder) {
				return;
			}

			const previousOrder = committedOrderIdsRef.current;
			if (
				previousOrder !== null &&
				previousOrder.length === managerOrder.sequenceIds.length &&
				previousOrder.every(
					(sequenceId, index) => sequenceId === managerOrder.sequenceIds[index],
				)
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
		return () => {
			unmounted = true;
			window.removeEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
		};
	}, [isStudio, sequenceManagerId]);

	const registerSequence = useCallback((seq: TSequence) => {
		setSequences((seqs) => {
			return [
				...seqs,
				{
					...seq,
					timelineOrder: committedOrderRef.current?.get(seq.id) ?? null,
				},
			];
		});
	}, []);
	const updateSequence = useCallback((seq: TSequence) => {
		setSequences((seqs) => {
			const index = seqs.findIndex((item) => item.id === seq.id);
			if (index === -1) {
				return seqs;
			}

			const next = [...seqs];
			next[index] = {
				...seq,
				timelineOrder: committedOrderRef.current?.get(seq.id) ?? null,
			};
			return next;
		});
	}, []);

	const unregisterSequence = useCallback((seq: string) => {
		setSequences((seqs) => seqs.filter((s) => s.id !== seq));
	}, []);

	const sequenceContext: SequenceManagerContext = useMemo(() => {
		return {
			registerSequence,
			sequences,
			updateSequence,
			unregisterSequence,
		};
	}, [registerSequence, sequences, unregisterSequence, updateSequence]);
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

	const providers = (
		<SequenceManagerRefContext.Provider value={sequencesRef}>
			<SequenceManager.Provider value={sequenceContext}>
				<VisualModePropStatusesRefContext.Provider value={propStatusesRef}>
					<VisualModePropStatusesContext.Provider value={propStatusesContext}>
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
										{children}
									</VisualModeBatchSettersContext.Provider>
								</VisualModeSettersContext.Provider>
							</VisualModeDragOverridesContext.Provider>
						</SequenceManagerScopeProviders>
					</VisualModePropStatusesContext.Provider>
				</VisualModePropStatusesRefContext.Provider>
			</SequenceManager.Provider>
		</SequenceManagerRefContext.Provider>
	);

	return isStudio ? (
		<SequenceManagerOrderMarker managerId={sequenceManagerId}>
			{providers}
		</SequenceManagerOrderMarker>
	) : (
		providers
	);
};
