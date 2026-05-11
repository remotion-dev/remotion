import type {SequenceNodePath} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import type {TSequence} from 'remotion';

export type SequencePropsSubscriptionState = {
	nodePath: SequenceNodePath | null;
	jsxInMapCallback: boolean;
};

export type SequencePropsSubscriptionStates = Record<
	string,
	SequencePropsSubscriptionState
>;

type Getters = {
	subscriptionStates: SequencePropsSubscriptionStates;
};

type Setters = {
	setSubscriptionState: (
		overrideId: string,
		state: SequencePropsSubscriptionState | null,
	) => void;
};

export const SequencePropsSubscriptionGettersContext = createContext<Getters>({
	subscriptionStates: {},
});

export const SequencePropsSubscriptionSettersContext = createContext<Setters>({
	setSubscriptionState: () => {
		throw new Error('SequencePropsSubscriptionSettersContext not initialized');
	},
});

export const SequencePropsSubscriptionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [subscriptionStates, setSubscriptionStates] =
		useState<SequencePropsSubscriptionStates>({});

	const setSubscriptionState = useCallback(
		(overrideId: string, state: SequencePropsSubscriptionState | null) => {
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

	const getters = useMemo((): Getters => {
		return {subscriptionStates};
	}, [subscriptionStates]);

	const setters = useMemo((): Setters => {
		return {setSubscriptionState};
	}, [setSubscriptionState]);

	return (
		<SequencePropsSubscriptionGettersContext.Provider value={getters}>
			<SequencePropsSubscriptionSettersContext.Provider value={setters}>
				{children}
			</SequencePropsSubscriptionSettersContext.Provider>
		</SequencePropsSubscriptionGettersContext.Provider>
	);
};

const EMPTY_STATE: SequencePropsSubscriptionState = {
	nodePath: null,
	jsxInMapCallback: false,
};

export const useSubscribedNodePath = (
	sequence: TSequence,
): SequencePropsSubscriptionState => {
	const {subscriptionStates} = useContext(
		SequencePropsSubscriptionGettersContext,
	);
	const overrideId = sequence.controls?.overrideId ?? null;
	if (!overrideId) {
		return EMPTY_STATE;
	}

	return subscriptionStates[overrideId] ?? EMPTY_STATE;
};
