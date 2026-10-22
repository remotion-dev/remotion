import {createContext} from 'react';
import type {ReactNode, RefObject} from 'react';

// Canvas supplies its authoring UI here so it shares the Player's timeline,
// clipping and fullscreen container without wrapping the user's composition.
export const CanvasOverlayContext = createContext<ReactNode>(null);

// The SDK measures against the unscaled composition and projects into the overlay.
export const CanvasContentContext = createContext<{
	readonly rootRef: RefObject<HTMLDivElement | null>;
	readonly scale: number;
} | null>(null);
