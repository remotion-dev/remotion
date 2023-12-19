import {PlayerInternals} from '@remotion/player';
import React, {useState} from 'react';

export const PlayerEmitterContext: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [emitter] = useState(() => new PlayerInternals.PlayerEmitter());

	return (
		<PlayerInternals.PlayerEventEmitterContext.Provider value={emitter}>
			{children}
		</PlayerInternals.PlayerEventEmitterContext.Provider>
	);
};
