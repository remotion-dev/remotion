import {createContext} from 'react';
import type {ReactNode} from 'react';

// Canvas supplies its authoring UI here so it shares the Player's timeline,
// clipping and fullscreen container without wrapping the user's composition.
export const CanvasOverlayContext = createContext<ReactNode>(null);
