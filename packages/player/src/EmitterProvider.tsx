import React, {useEffect, useState} from 'react';
import {PlayerEventEmitterContext} from './emitter-context.js';
import {PlayerEmitter} from './event-emitter.js';
import {useBufferStateEmitter} from './use-buffer-state-emitter.js';

export const PlayerEmitterProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly currentPlaybackRate: number | null;
}> = ({children, currentPlaybackRate}) => {
	const [emitter] = useState(() => new PlayerEmitter());

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
