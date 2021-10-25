import {createContext, MutableRefObject, useContext, useMemo} from 'react';

export type TimelineContextValue = {
	frame: number;
	playing: boolean;
	rootId: string;
	imperativePlaying: MutableRefObject<boolean>;
};

export type SetTimelineContextValue = {
	setFrame: (u: React.SetStateAction<number>) => void;
	setPlaying: (u: React.SetStateAction<boolean>) => void;
};

export const TimelineContext = createContext<TimelineContextValue>({
	frame: 0,
	playing: false,
	rootId: '',
	imperativePlaying: {
		current: false,
	},
});

export const SetTimelineContext = createContext<SetTimelineContextValue>({
	setFrame: () => {
		throw new Error('default');
	},
	setPlaying: () => {
		throw new Error('default');
	},
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
	(u: React.SetStateAction<boolean>) => void,
	MutableRefObject<boolean>
];

export const usePlayingState = (): PlayingReturnType => {
	const {playing, imperativePlaying} = useContext(TimelineContext);
	const {setPlaying} = useContext(SetTimelineContext);

	return useMemo(
		() => [playing, setPlaying, imperativePlaying],
		[imperativePlaying, playing, setPlaying]
	);
};
