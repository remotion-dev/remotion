import {useState, useCallback, useMemo} from 'react';
import {Internals} from 'remotion';
import type {
	NodePathsState,
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
} from 'remotion';

export const SequencePropsSubscriptionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [subscriptionStates, setSubscriptionStates] =
		useState<OverrideIdToNodePaths>({});

	const setSubscriptionState = useCallback(
		(overrideId: string, state: NodePathsState) => {
			setSubscriptionStates((prev) => {
				const existing = prev[overrideId];
				if (
					existing &&
					existing.nodePath === state.nodePath &&
					existing.jsxInMapCallback === state.jsxInMapCallback
				) {
					return prev;
				}

				return {...prev, [overrideId]: state};
			});
		},
		[],
	);

	const getters = useMemo((): OverrideToNodePathGetters => {
		return {overrideIdToNodePathMappings: subscriptionStates};
	}, [subscriptionStates]);

	const setters = useMemo((): OverrideToNodeSetters => {
		return {setOverrideIdToNodePath: setSubscriptionState};
	}, [setSubscriptionState]);

	return (
		<Internals.OverrideIdsToNodePathsGettersContext.Provider value={getters}>
			<Internals.OverrideIdsToNodePathsSettersContext.Provider value={setters}>
				{children}
			</Internals.OverrideIdsToNodePathsSettersContext.Provider>
		</Internals.OverrideIdsToNodePathsGettersContext.Provider>
	);
};
