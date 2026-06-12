import {createContext} from 'react';

export const SequenceContext = createContext<SequenceContextType | null>(null);

export type SequenceContextType = {
	absoluteFrom: number;
	cumulatedFrom: number;
	cumulatedNegativeFrom: number;
	relativeFrom: number;
	parentFrom: number;
	durationInFrames: number;
	id: string;
	width: number | null;
	height: number | null;
	premounting: boolean;
	postmounting: boolean;
	premountDisplay: number | null;
	postmountDisplay: number | null;
};
