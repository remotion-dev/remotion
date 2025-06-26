export const TIMELINE_PADDING = 16;
export const TIMELINE_BORDER = 1;
export const TIMELINE_ITEM_BORDER_BOTTOM = 1;

export const getTimelineLayerHeight = (type: 'video' | 'other') => {
	if (type === 'video') {
		return 50;
	}

	return 25;
};
