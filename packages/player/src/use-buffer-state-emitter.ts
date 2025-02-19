import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import type {PlayerEmitter, ThumbnailEmitter} from './event-emitter.js';

export const useBufferStateEmitter = (
	emitter: PlayerEmitter | ThumbnailEmitter,
) => {
	const bufferManager = useContext(Internals.BufferingContextReact);

	if (!bufferManager) {
		throw new Error('BufferingContextReact not found');
	}

	useEffect(() => {
		const clear1 = bufferManager.listenForBuffering(() => {
			bufferManager.buffering.current = true;
			emitter.dispatchWaiting({});
		});
		const clear2 = bufferManager.listenForResume(() => {
			bufferManager.buffering.current = false;
			emitter.dispatchResume({});
		});

		return () => {
			clear1.remove();
			clear2.remove();
		};
	}, [bufferManager, emitter]);
};
