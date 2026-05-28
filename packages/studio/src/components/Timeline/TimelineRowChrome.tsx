import React, {useCallback, useMemo} from 'react';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
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
	readonly style: React.CSSProperties;
	readonly selected: boolean;
	readonly selectable: boolean;
	readonly onSelect: () => void;
	readonly showSelectedBackground: boolean;
	readonly containsSelection: boolean;
	// When set, the chrome is wrapped in an outer container of this height with a
	// bottom track separator. The background highlight and click target span the
	// outer (used by sequence rows whose layer is taller than the chrome row).
	readonly outerHeight: number | null;
	readonly onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({
	depth,
	eye,
	arrow,
	children,
	style,
	selected,
	selectable,
	onSelect,
	showSelectedBackground,
	containsSelection,
	outerHeight,
	onDoubleClick,
}) => {
	const indentWidth = getTimelineRowIndentWidth(depth);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button === 0) {
				e.stopPropagation();
				onSelect();
			}
		},
		[onSelect],
	);

	const onContextMenu = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			onSelect();
		},
		[onSelect],
	);

	const highlightBackground =
		showSelectedBackground && (selected || containsSelection)
			? TIMELINE_SELECTED_BACKGROUND
			: undefined;

	const innerRowStyle = useMemo(
		(): React.CSSProperties => ({
			...rowBase,
			...style,
			backgroundColor:
				outerHeight === undefined ? highlightBackground : undefined,
		}),
		[style, outerHeight, highlightBackground],
	);

	const outerStyle = useMemo((): React.CSSProperties | undefined => {
		if (outerHeight === null) {
			return undefined;
		}

		return {
			height: outerHeight,
			borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			backgroundColor: highlightBackground,
		};
	}, [outerHeight, highlightBackground]);

	const chrome = (
		<>
			<div style={chromeColumnStyle}>
				{eye}
				{indentWidth > 0 ? <Padder depth={depth} /> : null}
				{arrow}
			</div>
			{children}
		</>
	);

	if (outerStyle) {
		return (
			<div
				style={outerStyle}
				onPointerDown={selectable ? onPointerDown : undefined}
				onContextMenu={selectable ? onContextMenu : undefined}
				onDoubleClick={onDoubleClick}
			>
				<div style={innerRowStyle}>{chrome}</div>
			</div>
		);
	}

	return (
		<div
			onPointerDown={selectable ? onPointerDown : undefined}
			onContextMenu={selectable ? onContextMenu : undefined}
			onDoubleClick={onDoubleClick}
			style={innerRowStyle}
		>
			{chrome}
		</div>
	);
};
