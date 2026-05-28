import React, {useMemo} from 'react';
import {Padder} from './Padder';
import {
	TIMELINE_ROW_BASE_PADDING,
	getTimelineRowIndentWidth,
} from './timeline-row-layout';
import {
	TIMELINE_SELECTED_BACKGROUND,
	TIMELINE_SELECTED_TEXT,
} from './TimelineSelection';

const rowBase: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
};

export const TimelineRowChrome: React.FC<{
	readonly depth: number;
	readonly eye: React.ReactNode;
	readonly arrow: React.ReactNode;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
	readonly selected?: boolean;
	readonly selectable?: boolean;
	readonly onSelect?: () => void;
}> = ({
	depth,
	eye,
	arrow,
	children,
	style,
	selected = false,
	selectable = false,
	onSelect,
}) => {
	const rowStyle = useMemo(
		(): React.CSSProperties => ({
			...rowBase,
			paddingLeft: TIMELINE_ROW_BASE_PADDING,
			...style,
			backgroundColor: selected ? TIMELINE_SELECTED_BACKGROUND : undefined,
			color: selected ? TIMELINE_SELECTED_TEXT : style?.color,
			cursor: selectable ? 'pointer' : style?.cursor,
		}),
		[selectable, selected, style],
	);

	const indentWidth = getTimelineRowIndentWidth(depth);

	return (
		<div style={rowStyle} onClick={selectable ? onSelect : undefined}>
			{eye}
			{indentWidth > 0 ? <Padder depth={depth} /> : null}
			{arrow}
			{children}
		</div>
	);
};
