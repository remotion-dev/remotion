import {createContext} from 'react';
import type {TimelineSceneRange} from './timeline-series-layout';

export const TimelineSceneRangeContext =
	createContext<TimelineSceneRange | null>(null);

export const TimelineInheritedSceneRangeContext =
	createContext<TimelineSceneRange | null>(null);

export const TimelineSceneClipHeightContext = createContext<number | null>(
	null,
);
