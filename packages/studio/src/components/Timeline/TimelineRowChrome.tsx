import React, {useCallback, useMemo} from 'react';
import {Padder} from './Padder';
import {
	TIMELINE_ROW_BASE_PADDING,
	getTimelineRowIndentWidth,
} from './timeline-row-layout';
import {TIMELINE_SELECTED_BACKGROUND} from './TimelineSelection';

const rowBase: React.CSSProperties = {
	alignItems: 'stretch',
	display: 'flex',
};

const chromeColumnStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flexShrink: 0,
	paddingLeft: TIMELINE_ROW_BASE_PADDING,
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
	readonly showSelectedBackground?: boolean;
}> = ({
	depth,
	eye,
	arrow,
	children,
	style,
	selected = false,
	selectable = false,
	onSelect,
	showSelectedBackground = true,
}) => {
	const rowStyle = useMemo(
		(): React.CSSProperties => ({
			...rowBase,
			...style,
			backgroundColor:
				selected && showSelectedBackground
					? TIMELINE_SELECTED_BACKGROUND
					: undefined,
		}),
		[selected, showSelectedBackground, style],
	);

	const indentWidth = getTimelineRowIndentWidth(depth);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button === 0) {
				onSelect?.();
			}
		},
		[onSelect],
	);

	return (
		<div
			style={rowStyle}
			onPointerDown={selectable ? onPointerDown : undefined}
			onContextMenu={selectable ? onSelect : undefined}
		>
			<div style={chromeColumnStyle}>
				{eye}
				{indentWidth > 0 ? <Padder depth={depth} /> : null}
				{arrow}
			</div>
			{children}
		</div>
	);
};
