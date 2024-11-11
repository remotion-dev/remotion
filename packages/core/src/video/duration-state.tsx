import React, {createContext, useMemo, useReducer} from 'react';
import {getAbsoluteSrc} from '../absolute-src.js';
type DurationState = Record<string, number>;

type DurationAction = {
	type: 'got-duration';
	src: string;
	durationInSeconds: number;
};

export const durationReducer = (
	state: DurationState,
	action: DurationAction,
) => {
	switch (action.type) {
		case 'got-duration': {
			const absoluteSrc = getAbsoluteSrc(action.src);
			if (state[absoluteSrc] === action.durationInSeconds) {
				return state;
			}

			return {
				...state,
				[absoluteSrc]: action.durationInSeconds,
			};
		}

		default:
			return state;
	}
};

type TDurationsContext = {
	durations: DurationState;
	setDurations: React.Dispatch<DurationAction>;
};

export const DurationsContext = createContext<TDurationsContext>({
	durations: {},
	setDurations: () => {
		throw new Error('context missing');
	},
});

export const DurationsContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [durations, setDurations] = useReducer(durationReducer, {});

	const value = useMemo(() => {
		return {
			durations,
			setDurations,
		};
	}, [durations]);

	return (
		<DurationsContext.Provider value={value}>
			{children}
		</DurationsContext.Provider>
	);
};
