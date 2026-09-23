import type {
	CanvasHover,
	CanvasHoverController,
} from '@remotion/canvas/internal';
import {
	createCanvasHoverController,
	useCanvasHover,
	useCanvasSequenceHover,
	useIsCanvasSequenceHovered,
} from '@remotion/canvas/internal';
import {createContext, useContext} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

export type TimelineSequenceHover = CanvasHover;

export const createTimelineSequenceHoverStore = createCanvasHoverController;

export const TimelineSequenceHoverContext =
	createContext<CanvasHoverController>(createTimelineSequenceHoverStore());

export const useTimelineSequenceHoverState = () => {
	return useCanvasHover(useContext(TimelineSequenceHoverContext));
};

export const useSetTimelineSequenceHover = () => {
	return useContext(TimelineSequenceHoverContext).setHoveredSequence;
};

export const useIsTimelineSequenceHovered = (nodePathKey: string | null) => {
	return useIsCanvasSequenceHovered(
		useContext(TimelineSequenceHoverContext),
		nodePathKey,
	);
};

export const useTimelineSequenceHover = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	return useCanvasSequenceHover(
		useContext(TimelineSequenceHoverContext),
		nodePathInfo,
		'timeline',
	);
};
