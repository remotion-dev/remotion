import {createContext} from 'react';
import type {SequenceNodePath} from './SequenceManager';

export type NodePathsState = {
	nodePath: SequenceNodePath | null;
	jsxInMapCallback: boolean;
};

export type OverrideIdToNodePaths = Record<string, NodePathsState>;

export type OverrideToNodePathGetters = {
	overrideIdToNodePathMappings: OverrideIdToNodePaths;
};

export type OverrideToNodeSetters = {
	setOverrideIdToNodePath: (overrideId: string, state: NodePathsState) => void;
};

export const OverrideIdsToNodePathsGettersContext =
	createContext<OverrideToNodePathGetters>({
		overrideIdToNodePathMappings: {},
	});

export const OverrideIdsToNodePathsSettersContext =
	createContext<OverrideToNodeSetters>({
		setOverrideIdToNodePath: () => {
			throw new Error('OverrideIdsToNodePathsSettersContext not initialized');
		},
	});
