import {useContext} from 'react';
import {SetTimelineContext} from './TimelineContext.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

export const useBuffering = () => {
	const {isBuffering, subscribeBuffering} = useContext(SetTimelineContext);
	return useSyncExternalStore(subscribeBuffering, isBuffering, isBuffering);
};
