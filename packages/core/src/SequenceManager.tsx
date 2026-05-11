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
	return JSON.stringify(nodePath);
};

export const stringToNodePath = (string: string): SequenceNodePath => {
	return JSON.parse(string);
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

export type VisualModeGetters = {
	visualModeEnabled: boolean;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
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
		values: Record<string, CanUpdateSequencePropStatus> | null,
	) => void;
};

const getCodeValues = (codeValues: CodeValues, nodePath: SequenceNodePath) => {
	return codeValues[nodePathToString(nodePath)] ?? undefined;
};

export type GetCodeValuesType = typeof getCodeValues;

export const VisualModeGettersContext = React.createContext<VisualModeGetters>({
	getDragOverrides: () => {
		throw new Error('VisualModeGettersContext not initialized');
	},
	getCodeValues: () => {
		throw new Error('VisualModeGettersContext not initialized');
	},
	visualModeEnabled: false,
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
	readonly visualModeEnabled: boolean;
}> = ({children, visualModeEnabled}) => {
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
			values: Record<string, CanUpdateSequencePropStatus> | null,
		) => {
			setCodeValuesMapState((prev) => {
				const key = nodePathToString(nodePath);
				if (prev[key] === values) {
					return prev;
				}

				if (values === null) {
					if (!(key in prev)) {
						return prev;
					}

					const next = {...prev};
					delete next[key];
					return next;
				}

				return {...prev, [key]: values};
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

	const gettersContext: VisualModeGetters = useMemo(() => {
		return {
			visualModeEnabled,
			getDragOverrides: (nodePath: SequenceNodePath) =>
				dragOverrides[nodePathToString(nodePath)] ?? {},
			getCodeValues: (nodePath: SequenceNodePath) =>
				getCodeValues(codeValues, nodePath),
		};
	}, [visualModeEnabled, dragOverrides, codeValues]);

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
				<VisualModeGettersContext.Provider value={gettersContext}>
					<VisualModeSettersContext.Provider value={settersContext}>
						{children}
					</VisualModeSettersContext.Provider>
				</VisualModeGettersContext.Provider>
			</SequenceVisibilityToggleContext.Provider>
		</SequenceManager.Provider>
	);
};
