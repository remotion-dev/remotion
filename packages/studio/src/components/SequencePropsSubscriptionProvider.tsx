import {useState, useCallback, useMemo} from 'react';
import {Internals} from 'remotion';
import type {
	SequencePropsSubscriptionState,
	SequencePropsSubscriptionStates,
	SequencePropsSubscriptionStatesGetters,
	SequencePropsSubscriptionStatesSetters,
} from 'remotion';

export const SequencePropsSubscriptionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [subscriptionStates, setSubscriptionStates] =
		useState<SequencePropsSubscriptionStates>({});

	const setSubscriptionState = useCallback(
		(overrideId: string, state: SequencePropsSubscriptionState) => {
			setSubscriptionStates((prev) => {
				if (state === null) {
					if (!(overrideId in prev)) {
						return prev;
					}

					const next = {...prev};
					delete next[overrideId];
					return next;
				}

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

	const getters = useMemo((): SequencePropsSubscriptionStatesGetters => {
		return {subscriptionStates};
	}, [subscriptionStates]);

	const setters = useMemo((): SequencePropsSubscriptionStatesSetters => {
		return {setSubscriptionState};
	}, [setSubscriptionState]);

	return (
		<Internals.SequencePropsSubscriptionGettersContext.Provider value={getters}>
			<Internals.SequencePropsSubscriptionSettersContext.Provider
				value={setters}
			>
				{children}
			</Internals.SequencePropsSubscriptionSettersContext.Provider>
		</Internals.SequencePropsSubscriptionGettersContext.Provider>
	);
};
