import {TIMELINE_INDENT} from './timeline-indent';

export const TIMELINE_ROW_BASE_PADDING = 5;

export const getTimelineRowPaddingLeft = (depth: number): number => {
	return TIMELINE_ROW_BASE_PADDING + depth * TIMELINE_INDENT;
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
