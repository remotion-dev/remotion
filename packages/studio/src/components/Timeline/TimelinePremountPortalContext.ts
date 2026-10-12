import {createContext} from 'react';

export const TimelinePremountPortalContext = createContext<{
	readonly container: HTMLDivElement;
	readonly top: number;
} | null>(null);
