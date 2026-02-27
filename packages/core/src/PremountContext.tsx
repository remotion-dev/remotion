import {createContext} from 'react';

export type PremountContextValue = {
	premountFramesRemaining: number;
	playing: boolean;
};

/**
 * @internal
 * Provides premounting state to internal components.
 * - premountFramesRemaining: accumulated frames remaining until premounting ends (0 if not premounting).
 * - playing: whether the player is currently playing. Sticky true: if any parent is playing, this is true.
 */
export const PremountContext = createContext<PremountContextValue>({
	premountFramesRemaining: 0,
	playing: false,
});
