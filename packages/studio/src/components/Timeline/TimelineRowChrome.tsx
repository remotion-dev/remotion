import React, {useCallback, useMemo} from 'react';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {Padder} from './Padder';
import {
	TIMELINE_ROW_BASE_PADDING,
	getTimelineRowIndentWidth,
	getTimelineRowLeftChromeWidth,
} from './timeline-row-layout';
import type {TimelineSelectionInteraction} from './TimelineSelection';
import {TIMELINE_SELECTED_BACKGROUND} from './TimelineSelection';

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
	onSelect,
	showSelectedBackground,
	containsSelection,
	outerHeight,
	onDragLeave,
	onDragOver,
	onDrop,
	onDoubleClick,
}) => {
	const indentWidth = getTimelineRowIndentWidth(depth);

	const keyframeControlsColumnStyle = useMemo(
		(): React.CSSProperties => ({
			...keyframeControlsColumnBaseStyle,
			width: getTimelineRowLeftChromeWidth(depth),
		}),
		[depth],
	);

	const chromeColumnStyle = useMemo(
		(): React.CSSProperties => ({
			alignItems: 'center',
			alignSelf: 'stretch',
			display: 'flex',
			flexShrink: 0,
			paddingLeft: TIMELINE_ROW_BASE_PADDING,
		}),
		[],
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
				style={outerStyle}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}
				// Use capture so row selection still updates when inner controls
				// stop propagation on pointerdown (for example InputDragger).
				onPointerDownCapture={selectable ? onPointerDown : undefined}
				onContextMenu={selectable ? onContextMenu : undefined}
				onDoubleClick={onDoubleClick}
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
			// Use capture so row selection still updates when inner controls
			// stop propagation on pointerdown (for example InputDragger).
			onPointerDownCapture={selectable ? onPointerDown : undefined}
			onContextMenu={selectable ? onContextMenu : undefined}
			onDoubleClick={onDoubleClick}
			style={innerRowStyle}
		>
			{chrome}
		</div>
	);
};
