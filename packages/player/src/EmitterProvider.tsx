import React, {useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context.js';
import {PlayerEmitter} from './event-emitter.js';

export const PlayerEmitterProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [emitter] = useState(() => new PlayerEmitter());
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

	return (
		<PlayerEventEmitterContext.Provider value={emitter}>
			{children}
		</PlayerEventEmitterContext.Provider>
	);
};
