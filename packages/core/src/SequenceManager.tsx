import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TSequence} from './CompositionManager.js';
import type {
	CanUpdateSequencePropStatus,
	CodeValues,
	DragOverrides,
	GetCodeValues,
	GetDragOverrides,
} from './use-schema.js';

export type SequenceManagerContext = {
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	sequences: TSequence[];
};

export type SequenceNodePath = Array<string | number>;

const nodePathToString = (nodePath: SequenceNodePath): string => {
	return nodePath.join('.');
};

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
};

export type VisualModeDragOverrides = {
	getDragOverrides: GetDragOverrides;
};

export type VisualModeSetters = {
	setDragOverrides: (
		nodePath: SequenceNodePath,
		key: string,
		value: unknown,
	) => void;
	clearDragOverrides: (nodePath: SequenceNodePath) => void;
	setCodeValues: (
		nodePath: SequenceNodePath,
		values: (
			prev: CanUpdateSequencePropsResponse,
		) => CanUpdateSequencePropsResponse,
	) => void;
};

export type CanUpdateSequencePropsResponseTrue = {
	canUpdate: true;
	props: Record<string, CanUpdateSequencePropStatus>;
};

export type CanUpdateSequencePropsResponseFalse = {
	canUpdate: false;
	reason: string;
};

export type CanUpdateSequencePropsResponse =
	| CanUpdateSequencePropsResponseTrue
	| CanUpdateSequencePropsResponseFalse;

const getCodeValuesCtx = (
	codeValues: CodeValues,
	nodePath: SequenceNodePath,
) => {
	const status = codeValues[nodePathToString(nodePath)];
	if (!status) {
		return undefined;
	}

	if (!status.canUpdate) {
		return undefined;
	}

	return status.props;
};

export type GetCodeValuesType = typeof getCodeValuesCtx;

export const VisualModeCodeValuesContext =
	React.createContext<VisualModeCodeValues>({
		getCodeValues: () => {
			throw new Error('VisualModeCodeValuesContext not initialized');
		},
	});

export const VisualModeDragOverridesContext =
	React.createContext<VisualModeDragOverrides>({
		getDragOverrides: () => {
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
	setCodeValues: () => {
		throw new Error('VisualModeSettersContext not initialized');
	},
});

export const SequenceManagerProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [sequences, setSequences] = useState<TSequence[]>([]);
	const [hidden, setHidden] = useState<Record<string, boolean>>({});
	const [dragOverrides, setControlOverrides] = useState<DragOverrides>({});
	const controlOverridesRef = useRef(dragOverrides);
	controlOverridesRef.current = dragOverrides;
	const [codeValues, setCodeValuesMapState] = useState<CodeValues>({});

	const setDragOverrides = useCallback(
		(nodePath: SequenceNodePath, key: string, value: unknown) => {
			setControlOverrides((prev) => ({
				...prev,
				[nodePathToString(nodePath)]: {
					...prev[nodePathToString(nodePath)],
					[key]: value,
				},
			}));
		},
		[],
	);

	const clearDragOverrides = useCallback((nodePath: SequenceNodePath) => {
		setControlOverrides((prev) => {
			const key = nodePathToString(nodePath);
			if (!prev[key]) {
				return prev;
			}

			const next = {...prev};
			delete next[key];
			return next;
		});
	}, []);

	const setCodeValues = useCallback(
		(
			nodePath: SequenceNodePath,
			values: (
				prev: CanUpdateSequencePropsResponse,
			) => CanUpdateSequencePropsResponse,
		) => {
			setCodeValuesMapState((prev) => {
				const key = nodePathToString(nodePath);

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
		(nodePath: SequenceNodePath) => {
			return dragOverrides[nodePathToString(nodePath)] ?? {};
		},
		[dragOverrides],
	);

	const getCodeValues = useCallback(
		(nodePath: SequenceNodePath) => {
			return getCodeValuesCtx(codeValues, nodePath);
		},
		[codeValues],
	);

	const codeValuesContext: VisualModeCodeValues = useMemo(() => {
		return {
			getCodeValues,
		};
	}, [getCodeValues]);

	const dragOverridesContext: VisualModeDragOverrides = useMemo(() => {
		return {
			getDragOverrides,
		};
	}, [getDragOverrides]);

	const settersContext: VisualModeSetters = useMemo(() => {
		return {
			setDragOverrides,
			clearDragOverrides,
			setCodeValues,
		};
	}, [setDragOverrides, clearDragOverrides, setCodeValues]);

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
