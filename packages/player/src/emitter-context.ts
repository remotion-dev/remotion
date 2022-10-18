import React from 'react';
import type {PlayerEmitter} from './event-emitter';

export const PlayerEventEmitterContext = React.createContext<
	PlayerEmitter | undefined
>(undefined);
