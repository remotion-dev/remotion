import {createContext} from 'react';
import type {SequenceNodePath} from './SequenceManager';

export type SequencePropsSubscriptionState = {
	nodePath: SequenceNodePath | null;
	jsxInMapCallback: boolean;
};

export type SequencePropsSubscriptionStates = Record<
	string,
	SequencePropsSubscriptionState
>;

export type SequencePropsSubscriptionStatesGetters = {
	subscriptionStates: SequencePropsSubscriptionStates;
};

export type SequencePropsSubscriptionStatesSetters = {
	setSubscriptionState: (
		overrideId: string,
		state: SequencePropsSubscriptionState,
	) => void;
};

export const SequencePropsSubscriptionGettersContext =
	createContext<SequencePropsSubscriptionStatesGetters>({
		subscriptionStates: {},
	});

export const SequencePropsSubscriptionSettersContext =
	createContext<SequencePropsSubscriptionStatesSetters>({
		setSubscriptionState: () => {
			throw new Error(
				'SequencePropsSubscriptionSettersContext not initialized',
			);
		},
	});
