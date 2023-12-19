import {TIMELINE_PADDING} from './timeline-layout';

export const getXPositionOfItemInTimelineImperatively = (
	frame: number,
	duration: number,
	width: number,
) => {
	const proportion = frame / (duration - 1);

	return proportion * (width - TIMELINE_PADDING * 2) + TIMELINE_PADDING;
};
