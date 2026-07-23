import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {Padder} from './Padder';
import {
	getTimelineRowIndentWidth,
	getTimelineRowLeftChromeWidth,
} from './timeline-row-layout';
import {TimelineRowLayoutContext} from './TimelineRowLayoutContext';
import type {TimelineSelectionInteraction} from './TimelineSelection';
import {
	getTimelineRowHighlightBackground,
	type TimelineSelection,
	useTimelineFocusableItem,
} from './TimelineSelection';

const rowBase: React.CSSProperties = {
	alignItems: 'stretch',
	display: 'flex',
};

const leftChromeStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flexShrink: 0,
};

const keyframeControlsColumnBaseStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	justifyContent: 'flex-start',
};

export const TimelineRowChrome: React.FC<{
	readonly depth: number;
	readonly eye: React.ReactNode;
	readonly keyframeControls?: React.ReactNode;
	readonly arrow: React.ReactNode;
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties;
	readonly selected: boolean;
	readonly selectable: boolean;
	readonly selectionItem: TimelineSelection | null;
	readonly onSelect: (interaction?: TimelineSelectionInteraction) => void;
	readonly showSelectedBackground: boolean;
	readonly containsSelection: boolean;
	// When set, the chrome is wrapped in an outer container of this height with a
	// bottom track separator. The background highlight and click target span the
	// outer (used by sequence rows whose layer is taller than the chrome row).
	readonly outerHeight: number | null;
	readonly onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
	readonly onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
	readonly onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
	readonly onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({
	depth,
	eye,
	keyframeControls,
	arrow,
	children,
	style,
	selected,
	selectable,
	selectionItem,
	onSelect,
	showSelectedBackground,
	containsSelection,
	outerHeight,
	onDragLeave,
	onDragOver,
	onDrop,
	onDoubleClick,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const {
		basePadding,
		keyframeControlsPadding,
		rowBorderRadius,
		rowHorizontalMargin,
	} = useContext(TimelineRowLayoutContext);
	const indentWidth = getTimelineRowIndentWidth(depth);
	useTimelineFocusableItem(selectionItem, ref);

	const keyframeControlsColumnStyle = useMemo(
		(): React.CSSProperties => ({
			...keyframeControlsColumnBaseStyle,
			boxSizing: keyframeControlsPadding === 0 ? undefined : 'border-box',
			paddingLeft: keyframeControlsPadding,
			width: getTimelineRowLeftChromeWidth(depth, basePadding),
		}),
		[basePadding, depth, keyframeControlsPadding],
	);

	const chromeColumnStyle = useMemo(
		(): React.CSSProperties => ({
			alignItems: 'center',
			alignSelf: 'stretch',
			display: 'flex',
			flexShrink: 0,
			paddingLeft: basePadding,
		}),
		[basePadding],
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button === 0) {
				e.stopPropagation();
				onSelect({
					shiftKey: e.shiftKey,
					toggleKey: e.metaKey || e.ctrlKey,
				});
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

	const highlightBackground = getTimelineRowHighlightBackground({
		showSelectedBackground,
		selected,
		containsSelection,
	});

	const innerRowStyle = useMemo(
		(): React.CSSProperties => ({
			...rowBase,
			...style,
			backgroundColor: outerHeight === null ? highlightBackground : undefined,
			borderRadius: rowBorderRadius,
			margin: `0 ${rowHorizontalMargin}px`,
		}),
		[
			style,
			outerHeight,
			highlightBackground,
			rowBorderRadius,
			rowHorizontalMargin,
		],
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
			<div style={leftChromeStyle}>
				{keyframeControls ? (
					<div style={keyframeControlsColumnStyle}>{keyframeControls}</div>
				) : (
					<div style={chromeColumnStyle}>
						{eye}
						{indentWidth > 0 ? <Padder depth={depth} /> : null}
						{arrow}
					</div>
				)}
			</div>
			{children}
		</>
	);

	if (outerStyle) {
		return (
			<div
				ref={ref}
				style={outerStyle}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}
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
			ref={ref}
			onDragLeave={onDragLeave}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onPointerDown={selectable ? onPointerDown : undefined}
			onContextMenu={selectable ? onContextMenu : undefined}
			onDoubleClick={onDoubleClick}
			style={innerRowStyle}
		>
			{chrome}
		</div>
	);
};
