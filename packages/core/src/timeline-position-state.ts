import {useEffect} from 'react';
import {createGlobalState} from 'react-hooks-global-state';
import {useVideoConfig} from './use-video-config';

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
		if (state[0] - 1 > videoConfig.durationInFrames) {
			state[1](videoConfig.durationInFrames - 1);
		}
	}, [state, videoConfig.durationInFrames]);
	return state;
};
