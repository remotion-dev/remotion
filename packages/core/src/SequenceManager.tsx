import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TSequence} from './CompositionManager.js';
import type {
	CanUpdateSequencePropStatus,
	CodeValues,
	DragOverrides,
} from './use-schema.js';

export type SequenceManagerContext = {
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	sequences: TSequence[];
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
	dragOverrides: DragOverrides;
	codeValues: CodeValues;
};

export type VisualModeSetters = {
	setDragOverrides: (sequenceId: string, key: string, value: unknown) => void;
	clearDragOverrides: (sequenceId: string) => void;
	setCodeValues: (
		sequenceId: string,
		values: Record<string, CanUpdateSequencePropStatus> | null,
	) => void;
};

export const VisualModeGettersContext = React.createContext<VisualModeGetters>({
	dragOverrides: {},
	codeValues: {},
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
		(sequenceId: string, key: string, value: unknown) => {
			setControlOverrides((prev) => ({
				...prev,
				[sequenceId]: {
					...prev[sequenceId],
					[key]: value,
				},
			}));
		},
		[],
	);

	const clearDragOverrides = useCallback((sequenceId: string) => {
		setControlOverrides((prev) => {
			if (!prev[sequenceId]) {
				return prev;
			}

			const next = {...prev};
			delete next[sequenceId];
			return next;
		});
	}, []);

	const setCodeValues = useCallback(
		(
			sequenceId: string,
			values: Record<string, CanUpdateSequencePropStatus> | null,
		) => {
			setCodeValuesMapState((prev) => {
				if (prev[sequenceId] === values) {
					return prev;
				}

				if (values === null) {
					if (!(sequenceId in prev)) {
						return prev;
					}

					const next = {...prev};
					delete next[sequenceId];
					return next;
				}

				return {...prev, [sequenceId]: values};
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
			dragOverrides,
			codeValues,
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
