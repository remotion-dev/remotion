import {createContext} from 'react';

export const SequenceContext = createContext<SequenceContextType | null>(null);

export type SequenceContextType = {
	/** Local frames elapsed per composition frame, including all ancestors. */
	playbackRate: number;
	/** Clock origins are expressed in composition frames. */
	absoluteFrom: number;
	cumulatedFrom: number;
	/** Negative elapsed local frames at the first visible frame. */
	cumulatedNegativeFrom: number;
	relativeFrom: number;
	parentFrom: number;
	/** Authored sequence length in frames, or the composition length. */
	durationInFrames: number;
	trimBefore: number;
	id: string;
	width: number | null;
	height: number | null;
	premounting: boolean;
	postmounting: boolean;
	premountDisplay: number | null;
	postmountDisplay: number | null;
};
