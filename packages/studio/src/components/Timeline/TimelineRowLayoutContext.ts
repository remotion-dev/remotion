import {createContext} from 'react';
import {
	INSPECTOR_ROW_BASE_PADDING,
	TIMELINE_ROW_BASE_PADDING,
} from './timeline-row-layout';

type TimelineRowLayout = {
	readonly basePadding: number;
	readonly highlightContainingSelection: boolean;
	readonly highlightSelectedLabel: boolean;
	readonly keyframeControlsPadding: number;
	readonly rowBorderRadius: number;
	readonly rowHorizontalMargin: number;
};

export const INSPECTOR_TIMELINE_ROW_LAYOUT: TimelineRowLayout = {
	basePadding: INSPECTOR_ROW_BASE_PADDING,
	highlightContainingSelection: false,
	highlightSelectedLabel: false,
	keyframeControlsPadding: 0,
	rowBorderRadius: 4,
	rowHorizontalMargin: 4,
};

export const TimelineRowLayoutContext = createContext<TimelineRowLayout>({
	basePadding: TIMELINE_ROW_BASE_PADDING,
	highlightContainingSelection: true,
	highlightSelectedLabel: true,
	keyframeControlsPadding: TIMELINE_ROW_BASE_PADDING,
	rowBorderRadius: 0,
	rowHorizontalMargin: 0,
});
