import React, {useContext} from 'react';
import type {TSequence} from './CompositionManager.js';
import type {RegistryStore} from './registry-store.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

export type SequenceManagerActions = {
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
