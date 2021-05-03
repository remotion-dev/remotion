import {createContext, useContext} from 'react';

export type TimelineContextValue = {
	frame: number;
	playing: boolean;
	rootId: string;
};

export type SetTimelineContextValue = {
	setFrame: (u: React.SetStateAction<number>) => void;
	setPlaying: (u: React.SetStateAction<boolean>) => void;
};

export const TimelineContext = createContext<TimelineContextValue>({
	frame: 0,
	playing: false,
	rootId: '',
});

export const SetTimelineContext = createContext<SetTimelineContextValue>({
	setFrame: () => undefined,
	setPlaying: () => undefined,
});

export const useTimelinePosition = (): number => {
	const state = useContext(TimelineContext);
	return state.frame;
};

export const useTimelineSetFrame = (): ((
	u: React.SetStateAction<number>
) => void) => {
	const {setFrame} = useContext(SetTimelineContext);
	return setFrame;
};

type PlayingReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void
];

export const usePlayingState = (): PlayingReturnType => {
	const {playing} = useContext(TimelineContext);
	const {setPlaying} = useContext(SetTimelineContext);
	return [playing, setPlaying];
};
