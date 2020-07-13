import {createGlobalState} from 'react-hooks-global-state';
import {useVideoConfig} from './use-video-config';
import {useEffect} from 'react';

const {useGlobalState} = createGlobalState({
	frame: 0,
});

export const useTimelinePosition = (): ReturnType<typeof useGlobalState> => {
	const state = useGlobalState('frame');
	const videoConfig = useVideoConfig();
	useEffect(() => {
		if (state[0] < 0) {
			state[1](0);
		}
		if (state[0] - 1 > videoConfig.frames) {
			state[1](videoConfig.frames - 1);
		}
	}, [state, videoConfig.frames]);
	return state;
};
