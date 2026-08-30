import {useSyncExternalStore, useContext} from 'react';
import {useTimelineContext} from './timeline-position-state.js';
import {SetTimelineContext} from './TimelineContext.js';

export const usePlaying = () => {
	const {isPlaying} = useTimelineContext();
	const {subscribePlaying} = useContext(SetTimelineContext);
	return useSyncExternalStore(subscribePlaying, isPlaying, isPlaying);
};
