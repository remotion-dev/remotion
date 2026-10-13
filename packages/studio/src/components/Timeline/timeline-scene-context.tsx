import React, {createContext} from 'react';
import type {TimelineSceneNode} from './timeline-scene-node';

export const TimelineSceneContext = createContext<TimelineSceneNode | null>(
	null,
);
export const TimelineSceneOrderContext = createContext('');

// Menus and the one active native editor are visible surfaces outside the
// timeline canvas. They must not register a second, invisible scene subtree.
export const TimelineDomBoundary: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) =>
	React.createElement(TimelineSceneContext.Provider, {value: null}, children);
