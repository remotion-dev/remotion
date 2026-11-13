import {createContext} from 'react';

export const PlaybackRangeContext = createContext<{
	readonly inFrame: number | null;
	readonly outFrame: number | null;
}>({inFrame: null, outFrame: null});
