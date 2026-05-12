import {createContext} from 'react';
import type {SequenceNodePath} from './SequenceManager';

export type OverrideIdToNodePaths = Record<string, SequenceNodePath>;

export type OverrideToNodePathGetters = {
	overrideIdToNodePathMappings: OverrideIdToNodePaths;
};

export type OverrideToNodeSetters = {
	setOverrideIdToNodePath: (
		overrideId: string,
		nodePath: SequenceNodePath,
	) => void;
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
