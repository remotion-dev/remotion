import {createContext} from 'react';

export type TimelineTrack = {
	readonly id: string;
	readonly name: string;
};

export type TimelineTrackItem = TimelineTrack & {
	readonly role: 'track' | 'clip' | 'transition' | 'overlay';
};

export const TimelineTrackContext = createContext<TimelineTrack | null>(null);

export const ExperimentalTracksEnabledContext = createContext(false);
