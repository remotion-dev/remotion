import {createContext} from 'react';

export type TimelineTrack = {
	readonly id: string;
	readonly name: string;
};

export type TimelineTrackItem = TimelineTrack & {
	readonly role: 'track' | 'clip' | 'transition' | 'overlay';
	readonly seriesOffset: number | null;
};

export const TimelineTrackContext = createContext<TimelineTrack | null>(null);

export const ExperimentalTracksEnabledContext = createContext(false);

export type TrackClip = {
	readonly id: string;
	readonly name: string;
	readonly from: number;
	readonly end: number;
};

// Validation remains active when experimental timeline grouping is disabled.
export const TrackValidationContext = createContext<{
	readonly register: (clip: TrackClip) => () => void;
} | null>(null);
