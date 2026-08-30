import React, {useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import type {TimelineContextValue} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context.js';
import {PlayerEmitter} from './event-emitter.js';
import {useBufferStateEmitter} from './use-buffer-state-emitter.js';

export const PlayerEmitterProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly currentPlaybackRate: number | null;
	readonly playbackStore: TimelineContextValue['playbackStore'];
}> = ({children, currentPlaybackRate, playbackStore}) => {
	const [emitter] = useState(
		() =>
			new PlayerEmitter((listener) => {
				playbackStore.store.subscribe((newSnap, oldSnap) => {
					if (newSnap.playing !== oldSnap.playing) {
						listener(newSnap.playing as boolean);
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
