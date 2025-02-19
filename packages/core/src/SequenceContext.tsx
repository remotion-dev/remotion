import {createContext} from 'react';

export const SequenceContext = createContext<SequenceContextType | null>(null);

export type SequenceContextType = {
	cumulatedFrom: number;
	relativeFrom: number;
	parentFrom: number;
	durationInFrames: number;
	id: string;
	width: number | null;
	height: number | null;
	premounting: boolean;
};
