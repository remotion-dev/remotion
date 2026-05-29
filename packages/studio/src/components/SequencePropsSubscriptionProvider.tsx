import {useState, useCallback, useMemo} from 'react';
import {Internals} from 'remotion';
import type {
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
	SequencePropsSubscriptionKey,
} from 'remotion';

export const SequencePropsSubscriptionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [overrideToNodePathMap, setOverrideIdToNodePathMap] =
		useState<OverrideIdToNodePaths>({});

	const setOverrideIdToNodePath = useCallback(
		(overrideId: string, state: SequencePropsSubscriptionKey) => {
			setOverrideIdToNodePathMap((prev) => {
				const existing = prev[overrideId];
				if (existing && existing === state) {
					return prev;
				}

				return {...prev, [overrideId]: state};
			});
		},
		[],
	);

	const getters = useMemo((): OverrideToNodePathGetters => {
		return {overrideIdToNodePathMappings: overrideToNodePathMap};
	}, [overrideToNodePathMap]);

	const setters = useMemo((): OverrideToNodeSetters => {
		return {setOverrideIdToNodePath};
	}, [setOverrideIdToNodePath]);

	return (
		<Internals.OverrideIdsToNodePathsGettersContext.Provider value={getters}>
			<Internals.OverrideIdsToNodePathsSettersContext.Provider value={setters}>
				{children}
			</Internals.OverrideIdsToNodePathsSettersContext.Provider>
		</Internals.OverrideIdsToNodePathsGettersContext.Provider>
	);
};
