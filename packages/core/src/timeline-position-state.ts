import {createGlobalState} from 'react-hooks-global-state';

const {useGlobalState} = createGlobalState({
	frame: 0,
	playing: false,
});

type TimelineReturnType = readonly [
	number,
	(u: React.SetStateAction<number>) => void
];

export const useTimelinePosition = (): TimelineReturnType => {
	const state = useGlobalState('frame');
	return state;
};

type PlayingReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void
];

export const usePlayingState = (): PlayingReturnType => {
	return useGlobalState('playing');
};
