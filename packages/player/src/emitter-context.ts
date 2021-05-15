import React from 'react';
import {PlayerEmitter} from './event-emitter';

export const PlayerEventEmitterContext = React.createContext<
	PlayerEmitter | undefined
>(undefined);
