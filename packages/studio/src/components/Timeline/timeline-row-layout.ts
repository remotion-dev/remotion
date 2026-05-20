import {TIMELINE_INDENT} from './timeline-indent';

export const TIMELINE_ROW_BASE_PADDING = 5;
export const TIMELINE_EYE_COLUMN_WIDTH = 22;
export const TIMELINE_ARROW_COLUMN_WIDTH = 16;

export const getTimelineRowIndentWidth = (depth: number): number => {
	return depth * TIMELINE_INDENT;
};

export const getTimelineRowLeftChromeWidth = (depth: number): number => {
	return (
		TIMELINE_ROW_BASE_PADDING +
		TIMELINE_EYE_COLUMN_WIDTH +
		getTimelineRowIndentWidth(depth) +
		TIMELINE_ARROW_COLUMN_WIDTH
	);
};

export const getTimelineFieldLabelFlexBasis = (depth: number): string => {
	return `calc(50% - ${getTimelineRowLeftChromeWidth(depth)}px)`;
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
