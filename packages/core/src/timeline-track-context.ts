import {createContext} from 'react';

export type TimelineTrack = {
	readonly id: string;
	readonly name: string;
};

export type TimelineTrackItem = TimelineTrack & {
	readonly role: 'track' | 'clip' | 'container' | 'transition' | 'overlay';
	/** Position in the containing sequence's clock, used for overlay markers. */
	readonly anchor: number | null;
};

export const TimelineTrackContext = createContext<TimelineTrack | null>(null);
