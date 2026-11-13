import type {Guide} from '../state/editor-guides';
import {BLUE, SELECTED_GUIDE, UNSELECTED_GUIDE} from './colors';

const GUIDE_CLICK_THRESHOLD_PX = 3;

export type GuidePointerDownPosition = {
	readonly guideId: string;
	readonly clientX: number;
	readonly clientY: number;
};

export type RulerGuideHighlight = {
	readonly guide: Guide;
	readonly color: string;
};

type SelectedTimelineItem = {
	readonly type: string;
	readonly guideId?: string;
};

export const isGuidePointerUpAClick = ({
	pointerDownPosition,
	guideId,
	clientX,
	clientY,
}: {
	readonly pointerDownPosition: GuidePointerDownPosition | null;
	readonly guideId: string;
	readonly clientX: number;
	readonly clientY: number;
}) => {
	if (pointerDownPosition === null || pointerDownPosition.guideId !== guideId) {
		return false;
	}

	return (
		Math.abs(clientX - pointerDownPosition.clientX) <=
			GUIDE_CLICK_THRESHOLD_PX &&
		Math.abs(clientY - pointerDownPosition.clientY) <= GUIDE_CLICK_THRESHOLD_PX
	);
};

export const getEditorGuideColor = ({
	selected,
	active,
}: {
	readonly selected: boolean;
	readonly active: boolean;
}) => {
	if (selected) {
		return BLUE;
	}

	return active ? SELECTED_GUIDE : UNSELECTED_GUIDE;
};

export const getRulerGuideHighlights = ({
	guidesList,
	selectedItems,
	hoveredGuideId,
	draggingGuideId,
}: {
	readonly guidesList: readonly Guide[];
	readonly selectedItems: readonly SelectedTimelineItem[];
	readonly hoveredGuideId: string | null;
	readonly draggingGuideId: string | null;
}): RulerGuideHighlight[] => {
	const selectedGuideIds = new Set(
		selectedItems.flatMap((item) =>
			item.type === 'guide' && item.guideId ? [item.guideId] : [],
		),
	);
	return guidesList.flatMap((guide): RulerGuideHighlight[] => {
		if (!guide.show) return [];
		if (selectedGuideIds.has(guide.id)) return [{guide, color: BLUE}];
		if (guide.id === draggingGuideId || guide.id === hoveredGuideId)
			return [{guide, color: SELECTED_GUIDE}];
		return [];
	});
};
