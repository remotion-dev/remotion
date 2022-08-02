import React, {useCallback, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {useZIndex} from '../../state/z-index';
import type {TimelineActionState} from './timeline-state-reducer';
import {TimelineCollapseToggle} from './TimelineCollapseToggle';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';

const HOOK_WIDTH = 7;
const BORDER_BOTTOM_LEFT_RADIUS = 2;
const SPACING = 5;

const textStyle: React.CSSProperties = {
	fontSize: 13,
};

const outer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2,
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	paddingLeft: TIMELINE_PADDING,
	wordBreak: 'break-all',
	textAlign: 'left',
};

const hookContainer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT,
	width: HOOK_WIDTH,
	position: 'relative',
};

const hook: React.CSSProperties = {
	borderLeft: '1px solid #555',
	borderBottom: '1px solid #555',
	borderBottomLeftRadius: BORDER_BOTTOM_LEFT_RADIUS,
	width: HOOK_WIDTH,
	position: 'absolute',
	bottom: TIMELINE_LAYER_HEIGHT / 2 - 1,
};

const space: React.CSSProperties = {
	width: SPACING,
};

const smallSpace: React.CSSProperties = {
	width: SPACING * 0.5,
};

const collapser: React.CSSProperties = {
	width: 8,
	userSelect: 'none',
	marginRight: 10,
};

const collapserButton: React.CSSProperties = {
	...collapser,
	border: 'none',
	background: 'none',
};

export const TimelineListItem: React.FC<{
	sequence: TSequence;
	nestedDepth: number;
	beforeDepth: number;
	collapsed: boolean;
	dispatchStateChange: React.Dispatch<TimelineActionState>;
	hash: string;
	canCollapse: boolean;
}> = ({
	nestedDepth,
	sequence,
	collapsed,
	beforeDepth,
	dispatchStateChange,
	hash,
	canCollapse,
}) => {
	const {tabIndex} = useZIndex();
	const leftOffset = HOOK_WIDTH + SPACING * 1.5;
	const hookStyle = useMemo(() => {
		return {
			...hook,
			height:
				TIMELINE_LAYER_HEIGHT +
				BORDER_BOTTOM_LEFT_RADIUS / 2 -
				(beforeDepth === nestedDepth ? 2 : 12),
		};
	}, [beforeDepth, nestedDepth]);

	const padder = useMemo((): React.CSSProperties => {
		return {
			width: leftOffset * nestedDepth,
		};
	}, [leftOffset, nestedDepth]);

	const toggleCollapse = useCallback(() => {
		if (collapsed) {
			dispatchStateChange({
				type: 'expand',
				hash,
			});
		} else {
			dispatchStateChange({
				type: 'collapse',
				hash,
			});
		}
	}, [collapsed, dispatchStateChange, hash]);
	const text =
		sequence.displayName.length > 80
			? sequence.displayName.slice(0, 80) + '...'
			: sequence.displayName;

	return (
		<div style={outer}>
			<div style={padder} />
			{canCollapse ? (
				<button
					tabIndex={tabIndex}
					type="button"
					style={collapserButton}
					onClick={toggleCollapse}
				>
					<TimelineCollapseToggle collapsed={collapsed} />
				</button>
			) : (
				<div style={collapser} />
			)}
			{sequence.parent && nestedDepth > 0 ? (
				<>
					<div style={smallSpace} />
					<div style={hookContainer}>
						<div style={hookStyle} />
					</div>
					<div style={space} />
				</>
			) : null}
			<div style={textStyle}>
				{text || 'Untitled'}
				<TimelineSequenceFrame
					duration={sequence.duration}
					from={sequence.from}
				/>
			</div>
		</div>
	);
};
