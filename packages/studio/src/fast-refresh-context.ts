import {createContext} from 'react';

export type FastRefreshContextType = {
	fastRefreshes: number;
	manualRefreshes: number;
	increaseManualRefreshes: () => void;
};

export const FastRefreshContext = createContext<FastRefreshContextType>({
	fastRefreshes: 0,
	manualRefreshes: 0,
	increaseManualRefreshes: () => {},
});
