import {
	CanvasInternals,
	createCanvasHoverController,
	useCanvasHover,
	useCanvasSequenceHover,
} from '@remotion/canvas';
import type {CanvasHover, CanvasHoverController} from '@remotion/canvas';
import {createContext, useContext} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const {useIsCanvasSequenceHovered} = CanvasInternals;

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
