import {createContext} from 'react';
import {
	INSPECTOR_ROW_BASE_PADDING,
	TIMELINE_ROW_BASE_PADDING,
} from './timeline-row-layout';

type TimelineRowLayout = {
	readonly basePadding: number;
	readonly keyframeControlsPadding: number;
};

export const INSPECTOR_TIMELINE_ROW_LAYOUT: TimelineRowLayout = {
	basePadding: INSPECTOR_ROW_BASE_PADDING,
	keyframeControlsPadding: 0,
};

export const TimelineRowLayoutContext = createContext<TimelineRowLayout>({
	basePadding: TIMELINE_ROW_BASE_PADDING,
	keyframeControlsPadding: TIMELINE_ROW_BASE_PADDING,
});
