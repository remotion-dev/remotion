import {TIMELINE_INDENT} from './timeline-indent';

export const TIMELINE_ROW_BASE_PADDING = 10;
export const INSPECTOR_ROW_BASE_PADDING = 5;
export const TIMELINE_EYE_COLUMN_WIDTH = 22;
export const TIMELINE_ARROW_COLUMN_WIDTH = 16;
export const TIMELINE_KEYFRAME_CONTROLS_WIDTH = 38;
export const TIMELINE_FIELD_LABEL_EXTRA_WIDTH = 15;

export const getTimelineRowIndentWidth = (depth: number): number => {
	return depth * TIMELINE_INDENT;
};

export const getTimelineRowLeftChromeWidth = (
	depth: number,
	basePadding = TIMELINE_ROW_BASE_PADDING,
): number => {
	return (
		basePadding +
		TIMELINE_EYE_COLUMN_WIDTH +
		getTimelineRowIndentWidth(depth) +
		TIMELINE_ARROW_COLUMN_WIDTH
	);
};

export const getTimelineFieldLabelFlexBasis = (
	depth: number,
	basePadding = TIMELINE_ROW_BASE_PADDING,
): string => {
	return `calc(50% - ${getTimelineRowLeftChromeWidth(depth, basePadding) - TIMELINE_FIELD_LABEL_EXTRA_WIDTH}px)`;
};

export const getExpandedRowDepth = ({
	nestedDepth,
	treeDepth,
}: {
	nestedDepth: number;
	treeDepth: number;
}): number => {
	return nestedDepth + 1 + treeDepth;
};
