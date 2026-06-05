import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TSequence} from './CompositionManager.js';
import type {
	CanUpdateSequencePropStatus,
	DragOverrideValue,
	DragOverrides,
	EffectDragOverrides,
	GetDragOverrides,
	GetEffectDragOverrides,
	PropStatuses,
} from './use-schema.js';

export type SequenceManagerContext = {
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	sequences: TSequence[];
};

export type SequenceManagerRef = {
	current: TSequence[];
};

export type SequenceNodePath = Array<string | number>;

export const SequenceManager = React.createContext<SequenceManagerContext>({
	registerSequence: () => {
		throw new Error('SequenceManagerContext not initialized');
	},
	unregisterSequence: () => {
		throw new Error('SequenceManagerContext not initialized');
	},
	sequences: [],
});

export const SequenceManagerRefContext =
	React.createContext<SequenceManagerRef>({
		current: [],
	});

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
	return `${key.nodePath.join('.')}.${key.sequenceKeys.join('.')}.${key.effectKeys.map((keys) => keys.join('.')).join('.')}`;
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
});

export type SequencePropsSubscriptionKey = {
	absolutePath: string;
	nodePath: SequenceNodePath;
	sequenceKeys: string[];
	effectKeys: string[][];
};

const effectDragOverridesKey = (
	nodePath: SequencePropsSubscriptionKey,
	effectIndex: number,
): string =>
	`${makeSequencePropsSubscriptionKey(nodePath)}.effects.${effectIndex}`;

export const SequenceManagerProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [sequences, setSequences] = useState<TSequence[]>([]);
	const sequencesRef = useRef(sequences);
	sequencesRef.current = sequences;
	const [dragOverrides, setControlOverrides] = useState<DragOverrides>({});
	const controlOverridesRef = useRef(dragOverrides);
	controlOverridesRef.current = dragOverrides;
	const [effectDragOverridesState, setEffectDragOverridesState] =
		useState<EffectDragOverrides>({});
	const [propStatuses, setPropStatusesMapState] = useState<PropStatuses>({});
	const propStatusesRef = useRef(propStatuses);
	propStatusesRef.current = propStatuses;

	const setDragOverrides = useCallback(
		(
			nodePath: SequencePropsSubscriptionKey,
			key: string,
			value: DragOverrideValue,
		) => {
			setControlOverrides((prev) => ({
				...prev,
				[makeSequencePropsSubscriptionKey(nodePath)]: {
					...prev[makeSequencePropsSubscriptionKey(nodePath)],
					[key]: value,
				},
			}));
		},
		[],
	);

	const clearDragOverrides = useCallback(
		(nodePath: SequencePropsSubscriptionKey) => {
			setControlOverrides((prev) => {
				const key = makeSequencePropsSubscriptionKey(nodePath);
				if (!prev[key]) {
					return prev;
				}

				const next = {...prev};
				delete next[key];
				return next;
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
		) => {
			setEffectDragOverridesState((prev) => {
				const mapKey = effectDragOverridesKey(nodePath, effectIndex);
				return {
					...prev,
					[mapKey]: {
						...prev[mapKey],
						[key]: value,
					},
				};
			});
		},
		[],
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

	const registerSequence = useCallback((seq: TSequence) => {
		setSequences((seqs) => {
			return [...seqs, seq];
		});
	}, []);

	const unregisterSequence = useCallback((seq: string) => {
		setSequences((seqs) => seqs.filter((s) => s.id !== seq));
	}, []);

	const sequenceContext: SequenceManagerContext = useMemo(() => {
		return {
			registerSequence,
			sequences,
			unregisterSequence,
		};
	}, [registerSequence, sequences, unregisterSequence]);

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
		};
	}, [
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		setPropStatuses,
	]);

	return (
		<SequenceManagerRefContext.Provider value={sequencesRef}>
			<SequenceManager.Provider value={sequenceContext}>
				<VisualModePropStatusesRefContext.Provider value={propStatusesRef}>
					<VisualModePropStatusesContext.Provider value={propStatusesContext}>
						<VisualModeDragOverridesContext.Provider
							value={dragOverridesContext}
						>
							<VisualModeSettersContext.Provider value={settersContext}>
								{children}
							</VisualModeSettersContext.Provider>
						</VisualModeDragOverridesContext.Provider>
					</VisualModePropStatusesContext.Provider>
				</VisualModePropStatusesRefContext.Provider>
			</SequenceManager.Provider>
		</SequenceManagerRefContext.Provider>
	);
};
