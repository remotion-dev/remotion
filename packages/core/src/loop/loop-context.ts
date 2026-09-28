import {createContext} from 'react';

export type LoopContextType = {
	iteration: number;
	durationInFrames: number;
};

export const LoopContext = createContext<LoopContextType | null>(null);
