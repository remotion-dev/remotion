import React, {useCallback, useContext, useMemo} from 'react';
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
	TIMELINE_SELECTED_BACKGROUND,
} from './TimelineSelection';

export const TimelineRowSelectedBackgroundContext = React.createContext<string>(
	TIMELINE_SELECTED_BACKGROUND,
);

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

export const TimelineRowKeyframeControlsColumn: React.FC<{
	readonly children: React.ReactNode;
	readonly depth: number;
}> = ({children, depth}) => {
	const {basePadding, keyframeControlsPadding} = useContext(
		TimelineRowLayoutContext,
	);
	const style = useMemo(
		(): React.CSSProperties => ({
			...keyframeControlsColumnBaseStyle,
			boxSizing: keyframeControlsPadding === 0 ? undefined : 'border-box',
			paddingLeft: keyframeControlsPadding,
			width: getTimelineRowLeftChromeWidth(depth, basePadding),
		}),
		[basePadding, depth, keyframeControlsPadding],
	);

	return (
		<div style={leftChromeStyle}>
			<div style={style}>{children}</div>
		</div>
	);
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
	readonly onSelect: (interaction?: TimelineSelectionInteraction) => void;
	readonly showSelectedBackground: boolean;
	readonly containsSelection: boolean;
	readonly hovered?: boolean;
	// When set, the chrome is wrapped in an outer container of this height with a
	// bottom track separator. The background highlight and click target span the
	// outer (used by sequence rows whose layer is taller than the chrome row).
	readonly outerHeight: number | null;
	readonly onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
	readonly onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
	readonly onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
	readonly onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
	readonly onPointerEnter?: () => void;
	readonly onPointerLeave?: () => void;
}> = ({
	depth,
	eye,
	keyframeControls,
	arrow,
	children,
	style,
	selected,
	selectable,
	onSelect,
	showSelectedBackground,
	containsSelection,
	hovered = false,
	outerHeight,
	onDragLeave,
	onDragOver,
	onDrop,
	onDoubleClick,
	onPointerEnter,
	onPointerLeave,
}) => {
	const {basePadding, rowBorderRadius, rowHorizontalMargin} = useContext(
		TimelineRowLayoutContext,
	);
	const selectedBackground = useContext(TimelineRowSelectedBackgroundContext);
	const indentWidth = getTimelineRowIndentWidth(depth);

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

	const onDoubleClickIfNotInteractive = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const {target} = e;
			if (
				target instanceof Element &&
				e.currentTarget.contains(
					target.closest(
						'button, input, select, textarea, a, [contenteditable="true"]',
					),
				)
			) {
				e.stopPropagation();
				return;
			}

			onDoubleClick?.(e);
		},
		[onDoubleClick],
	);

	const highlightBackground = getTimelineRowHighlightBackground({
		showSelectedBackground,
		selected,
		containsSelection,
		hovered,
		selectedBackground,
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
			{keyframeControls ? (
				<TimelineRowKeyframeControlsColumn depth={depth}>
					{keyframeControls}
				</TimelineRowKeyframeControlsColumn>
			) : (
				<div style={leftChromeStyle}>
					<div style={chromeColumnStyle}>
						{eye}
						{indentWidth > 0 ? <Padder depth={depth} /> : null}
						{arrow}
					</div>
				</div>
			)}
			{children}
		</>
	);

	if (outerStyle) {
		return (
			<div
				style={outerStyle}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onPointerDown={selectable ? onPointerDown : undefined}
				onContextMenu={selectable ? onContextMenu : undefined}
				onDoubleClick={onDoubleClickIfNotInteractive}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
			>
				<div style={innerRowStyle}>{chrome}</div>
			</div>
		);
	}

	return (
		<div
			onDragLeave={onDragLeave}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onPointerDown={selectable ? onPointerDown : undefined}
			onContextMenu={selectable ? onContextMenu : undefined}
			onDoubleClick={onDoubleClickIfNotInteractive}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={innerRowStyle}
		>
			{chrome}
		</div>
	);
};
