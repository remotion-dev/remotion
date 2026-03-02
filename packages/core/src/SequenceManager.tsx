import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TSequence} from './CompositionManager.js';
import type {CanUpdateSequencePropStatus} from './use-schema.js';

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

export type VisualModeOverrides = {
	visualModeEnabled: boolean;
	dragOverrides: Record<string, Record<string, unknown>>;
	setDragOverrides: (sequenceId: string, key: string, value: unknown) => void;
	clearDragOverrides: (sequenceId: string) => void;
	codeValues: Record<string, Record<string, CanUpdateSequencePropStatus>>;
	setCodeValues: (
		sequenceId: string,
		values: Record<string, CanUpdateSequencePropStatus> | null,
	) => void;
};

export const VisualModeOverridesContext =
	React.createContext<VisualModeOverrides>({
		dragOverrides: {},
		setDragOverrides: () => {
			throw new Error('VisualModeOverridesContext not initialized');
		},
		clearDragOverrides: () => {
			throw new Error('VisualModeOverridesContext not initialized');
		},
		codeValues: {},
		setCodeValues: () => {
			throw new Error('VisualModeOverridesContext not initialized');
		},
		visualModeEnabled: false,
	});

export const SequenceManagerProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly visualModeEnabled: boolean;
}> = ({children, visualModeEnabled}) => {
	const [sequences, setSequences] = useState<TSequence[]>([]);
	const [hidden, setHidden] = useState<Record<string, boolean>>({});
	const [dragOverrides, setControlOverrides] = useState<
		Record<string, Record<string, unknown>>
	>({});
	const controlOverridesRef = useRef(dragOverrides);
	controlOverridesRef.current = dragOverrides;
	const [codeValues, setCodeValuesMapState] = useState<
		Record<string, Record<string, CanUpdateSequencePropStatus>>
	>({});

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

	const overrideContext: VisualModeOverrides = useMemo(() => {
		return {
			visualModeEnabled,
			dragOverrides,
			setDragOverrides,
			clearDragOverrides,
			codeValues,
			setCodeValues,
		};
	}, [
		visualModeEnabled,
		dragOverrides,
		setDragOverrides,
		clearDragOverrides,
		codeValues,
		setCodeValues,
	]);

	return (
		<SequenceManager.Provider value={sequenceContext}>
			<SequenceVisibilityToggleContext.Provider value={hiddenContext}>
				<VisualModeOverridesContext.Provider value={overrideContext}>
					{children}
				</VisualModeOverridesContext.Provider>
			</SequenceVisibilityToggleContext.Provider>
		</SequenceManager.Provider>
	);
};
