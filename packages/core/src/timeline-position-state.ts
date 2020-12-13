import {createContext, useContext} from 'react';

export type TimelineContextValue = {
	frame: number;
	playing: boolean;
	setFrame: (u: React.SetStateAction<number>) => void;
	setPlaying: (u: React.SetStateAction<boolean>) => void;
};

export const TimelineContext = createContext<TimelineContextValue>({
	frame: 0,
	playing: false,
	setFrame: () => void 0,
	setPlaying: () => void 0,
});

type TimelineReturnType = readonly [
	number,
	(u: React.SetStateAction<number>) => void
];

export const useTimelinePosition = (): TimelineReturnType => {
	const state = useContext(TimelineContext);
	return [state.frame, state.setFrame];
};

type PlayingReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void
];

export const usePlayingState = (): PlayingReturnType => {
	const state = useContext(TimelineContext);
	return [state.playing, state.setPlaying];
};
