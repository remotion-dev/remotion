import React, {useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context.js';
import {PlayerEmitter} from './event-emitter.js';
import {useBufferStateEmitter} from './use-buffer-state-emitter.js';

export const PlayerEmitterProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly currentPlaybackRate: number | null;
	readonly playingStore: Internals.RuntimeValueStoreController<{
		playing: boolean;
	}>;
}> = ({children, currentPlaybackRate, playingStore}) => {
	const [emitter] = useState(
		() =>
			new PlayerEmitter((listener) => {
				let previous = playingStore.store.getSnapshot().playing;
				playingStore.store.subscribe(() => {
					const next = playingStore.store.getSnapshot().playing;
					if (next !== previous) {
						previous = next;
						listener(next);
					}
				});
			}),
	);

	const bufferManager = useContext(Internals.BufferingContextReact);
	if (!bufferManager) {
		throw new Error('BufferingContextReact not found');
	}

	useEffect(() => {
		if (currentPlaybackRate) {
			emitter.dispatchRateChange(currentPlaybackRate);
		}
	}, [emitter, currentPlaybackRate]);

	useBufferStateEmitter(emitter);

	return (
		<PlayerEventEmitterContext.Provider value={emitter}>
			{children}
		</PlayerEventEmitterContext.Provider>
	);
};
