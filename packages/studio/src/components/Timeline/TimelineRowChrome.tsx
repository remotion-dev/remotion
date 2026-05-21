import React, {useMemo} from 'react';
import {Padder} from './Padder';
import {
	TIMELINE_ROW_BASE_PADDING,
	getTimelineRowIndentWidth,
} from './timeline-row-layout';

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
}> = ({depth, eye, arrow, children, style}) => {
	const rowStyle = useMemo(
		(): React.CSSProperties => ({
			...rowBase,
			paddingLeft: TIMELINE_ROW_BASE_PADDING,
			...style,
		}),
		[style],
	);

	const indentWidth = getTimelineRowIndentWidth(depth);

	return (
		<div style={rowStyle}>
			{eye}
			{indentWidth > 0 ? <Padder depth={depth} /> : null}
			{arrow}
			{children}
		</div>
	);
};
