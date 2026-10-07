import {createContext} from 'react';
import {DEFAULT_PREMOUNT_IN_SECONDS} from './default-premount-in-seconds.js';

export const DefaultPremountContext = createContext(
	DEFAULT_PREMOUNT_IN_SECONDS,
);
