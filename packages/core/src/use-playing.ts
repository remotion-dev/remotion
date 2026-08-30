import {useSyncExternalStore} from 'react';
import {useTimelineContext} from './timeline-position-state.js';

export const usePlaying = () => {
	const {playbackStore} = useTimelineContext();
	return useSyncExternalStore(
		playbackStore.store.subscribe,
		() => playbackStore.store.getSnapshot().playing as boolean,
		() => playbackStore.store.getSnapshot().playing as boolean,
	);
};
