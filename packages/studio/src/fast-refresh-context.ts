import {createContext} from 'react';

export type FastRefreshContextType = {
	fastRefreshes: number;
	fastRefreshGeneration: number;
	isFastRefreshing: boolean;
	manualRefreshes: number;
	increaseManualRefreshes: () => void;
};

export const FastRefreshContext = createContext<FastRefreshContextType>({
	fastRefreshes: 0,
	fastRefreshGeneration: 0,
	isFastRefreshing: false,
	manualRefreshes: 0,
	increaseManualRefreshes: () => {},
});
