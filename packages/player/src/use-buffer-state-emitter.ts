import {useContext, useLayoutEffect} from 'react';
import {Internals} from 'remotion';
import type {PlayerEmitter, ThumbnailEmitter} from './event-emitter.js';

export const useBufferStateEmitter = (
	emitter: PlayerEmitter | ThumbnailEmitter,
) => {
	const {subscribeBuffering} = useContext(Internals.SetTimelineContext);

	useLayoutEffect(() => {
		return subscribeBuffering((state) => {
			if (state.buffering) {
				emitter.dispatchWaiting({});
			} else {
				emitter.dispatchResume({});
			}
		});
	}, [emitter, subscribeBuffering]);
};
