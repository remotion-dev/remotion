import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TSequence} from './CompositionManager.js';
import type {
	CanUpdateSequencePropStatus,
	CodeValues,
	DragOverrides,
	EffectDragOverrides,
	GetCodeValues,
	GetDragOverrides,
	GetEffectCodeValues,
	GetEffectDragOverrides,
} from './use-schema.js';

export type SequenceManagerContext = {
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	sequences: TSequence[];
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

export type SequenceVisibilityToggleState = {
	hidden: Record<string, boolean>;
	setHidden: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

export const SequenceVisibilityToggleContext =
	React.createContext<SequenceVisibilityToggleState>({
		hidden: {},
		setHidden: () => {
			throw new Error('SequenceVisibilityToggle not initialized');
		},
	});

export type VisualModeCodeValues = {
	getCodeValues: GetCodeValues;
	getEffectCodeValues: GetEffectCodeValues;
};

export type VisualModeDragOverrides = {
	getDragOverrides: GetDragOverrides;
	getEffectDragOverrides: GetEffectDragOverrides;
};

export type VisualModeSetters = {
	setDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		key: string,
		value: unknown,
	) => void;
	clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	setEffectDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		effectIndex: number,
		key: string,
		value: unknown,
	) => void;
	clearEffectDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		effectIndex: number,
	) => void;
	setCodeValues: (
		nodePath: SequencePropsSubscriptionKey,
		values: (
			prev: CanUpdateSequencePropsResponse,
		) => CanUpdateSequencePropsResponse,
	) => void;
};

export type CanUpdateEffectPropsResponseTrue = {
	canUpdate: true;
	callee: string;
	effectIndex: number;
	props: Record<string, CanUpdateSequencePropStatus>;
};

export type CanUpdateEffectPropsResponseFalse = {
	canUpdate: false;
	effectIndex: number;
	reason: 'not-found' | 'computed' | 'not-call-expression';
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
	reason: string;
};

export type CanUpdateSequencePropsResponse =
	| CanUpdateSequencePropsResponseTrue
	| CanUpdateSequencePropsResponseFalse;

export const makeSequencePropsSubscriptionKey = (
	key: SequencePropsSubscriptionKey,
): string => {
	return `${key.nodePath.join('.')}.${key.sequenceKeys.join('.')}.${key.effectKeys.map((keys) => keys.join('.')).join('.')}`;
};

const getCodeValuesCtx = (
	codeValues: CodeValues,
	nodePath: SequencePropsSubscriptionKey,
) => {
	const status = codeValues[makeSequencePropsSubscriptionKey(nodePath)];
	if (!status) {
		return undefined;
	}

	if (!status.canUpdate) {
		return undefined;
	}

	return status.props;
};

const getEffectCodeValuesCtx = ({
	codeValues,
	nodePath,
	effectIndex,
}: {
	codeValues: CodeValues;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
}) => {
	const status = codeValues[makeSequencePropsSubscriptionKey(nodePath)];
	if (!status || !status.canUpdate) {
		return undefined;
	}

	const effect = status.effects.find((e) => e.effectIndex === effectIndex);
	if (!effect || !effect.canUpdate) {
		return undefined;
	}

	return effect.props;
};

export type GetCodeValuesType = typeof getCodeValuesCtx;

export const VisualModeCodeValuesContext =
	React.createContext<VisualModeCodeValues>({
		getCodeValues: () => {
			throw new Error('VisualModeCodeValuesContext not initialized');
		},
		getEffectCodeValues: () => {
			throw new Error('VisualModeCodeValuesContext not initialized');
		},
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
	setCodeValues: () => {
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
	const [hidden, setHidden] = useState<Record<string, boolean>>({});
	const [dragOverrides, setControlOverrides] = useState<DragOverrides>({});
	const controlOverridesRef = useRef(dragOverrides);
	controlOverridesRef.current = dragOverrides;
	const [effectDragOverridesState, setEffectDragOverridesState] =
		useState<EffectDragOverrides>({});
	const [codeValues, setCodeValuesMapState] = useState<CodeValues>({});

	const setDragOverrides = useCallback(
		(nodePath: SequencePropsSubscriptionKey, key: string, value: unknown) => {
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
			value: unknown,
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

	const setCodeValues = useCallback(
		(
			nodePath: SequencePropsSubscriptionKey,
			values: (
				prev: CanUpdateSequencePropsResponse,
			) => CanUpdateSequencePropsResponse,
		) => {
			setCodeValuesMapState((prev) => {
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

	const hiddenContext: SequenceVisibilityToggleState = useMemo(() => {
		return {
			hidden,
			setHidden,
		};
	}, [hidden]);

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

	const getCodeValues = useCallback(
		(nodePath: SequencePropsSubscriptionKey) => {
			return getCodeValuesCtx(codeValues, nodePath);
		},
		[codeValues],
	);

	const getEffectCodeValues = useCallback(
		(nodePath: SequencePropsSubscriptionKey, effectIndex: number) => {
			return getEffectCodeValuesCtx({codeValues, nodePath, effectIndex});
		},
		[codeValues],
	);

	const codeValuesContext: VisualModeCodeValues = useMemo(() => {
		return {
			getCodeValues,
			getEffectCodeValues,
		};
	}, [getCodeValues, getEffectCodeValues]);

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
			setCodeValues,
		};
	}, [
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		setCodeValues,
	]);

	return (
		<SequenceManager.Provider value={sequenceContext}>
			<SequenceVisibilityToggleContext.Provider value={hiddenContext}>
				<VisualModeCodeValuesContext.Provider value={codeValuesContext}>
					<VisualModeDragOverridesContext.Provider value={dragOverridesContext}>
						<VisualModeSettersContext.Provider value={settersContext}>
							{children}
						</VisualModeSettersContext.Provider>
					</VisualModeDragOverridesContext.Provider>
				</VisualModeCodeValuesContext.Provider>
			</SequenceVisibilityToggleContext.Provider>
		</SequenceManager.Provider>
	);
};
