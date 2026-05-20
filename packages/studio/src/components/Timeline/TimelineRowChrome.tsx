import React, {useMemo} from 'react';
import {getTimelineRowPaddingLeft} from './timeline-row-layout';

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
			paddingLeft: getTimelineRowPaddingLeft(depth),
			...style,
		}),
		[depth, style],
	);

	return (
		<div style={rowStyle}>
			{eye}
			{arrow}
			{children}
		</div>
	);
};
