import {createContext} from 'react';
import type {SequencePropsSubscriptionKey} from './SequenceManager';

export type OverrideIdToNodePaths = Record<
	string,
	SequencePropsSubscriptionKey
>;

export type OverrideToNodePathGetters = {
	overrideIdToNodePathMappings: OverrideIdToNodePaths;
};

export type OverrideToNodeSetters = {
	setOverrideIdToNodePath: (
		overrideId: string,
		nodePath: SequencePropsSubscriptionKey,
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
