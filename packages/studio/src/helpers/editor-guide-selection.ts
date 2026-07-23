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

const findGuide = (guidesList: readonly Guide[], guideId: string | null) => {
	if (guideId === null) {
		return null;
	}

	return guidesList.find((guide) => guide.id === guideId && guide.show) ?? null;
};

export const getRulerGuideHighlight = ({
	guidesList,
	selectedItems,
	hoveredGuideId,
	draggingGuideId,
}: {
	readonly guidesList: readonly Guide[];
	readonly selectedItems: readonly SelectedTimelineItem[];
	readonly hoveredGuideId: string | null;
	readonly draggingGuideId: string | null;
}): RulerGuideHighlight | null => {
	const selectedGuideId =
		selectedItems.length === 1 && selectedItems[0]?.type === 'guide'
			? (selectedItems[0].guideId ?? null)
			: null;
	const selectedGuide = findGuide(guidesList, selectedGuideId);
	if (selectedGuide) {
		return {
			guide: selectedGuide,
			color: BLUE,
		};
	}

	const draggingGuide = findGuide(guidesList, draggingGuideId);
	if (draggingGuide) {
		return {
			guide: draggingGuide,
			color: SELECTED_GUIDE,
		};
	}

	const hoveredGuide = findGuide(guidesList, hoveredGuideId);
	if (hoveredGuide) {
		return {
			guide: hoveredGuide,
			color: SELECTED_GUIDE,
		};
	}

	return null;
};
