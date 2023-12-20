import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {LIGHT_COLOR, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {TimelineLayerEye} from './TimelineLayerEye';

const HOOK_WIDTH = 7;
const BORDER_BOTTOM_LEFT_RADIUS = 2;
const SPACING = 5;

const TIMELINE_LAYER_PADDING = HOOK_WIDTH + SPACING;

export const TOTAL_TIMELINE_LAYER_LEFT_PADDING = TIMELINE_PADDING;

const textStyle: React.CSSProperties = {
	fontSize: 12,
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
	lineHeight: 1,
	color: LIGHT_COLOR,
	userSelect: 'none',
};

const outer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT + TIMELINE_ITEM_BORDER_BOTTOM,
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	wordBreak: 'break-all',
	textAlign: 'left',
	paddingLeft: SPACING,
	borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
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
	flexShrink: 0,
};

export const TimelineListItem: React.FC<{
	sequence: TSequence;
	nestedDepth: number;
	beforeDepth: number;
	hash: string;
}> = ({nestedDepth, sequence, beforeDepth}) => {
	const {hidden, setHidden} = useContext(
		Internals.SequenceVisibilityToggleContext,
	);

	const leftOffset = TIMELINE_LAYER_PADDING;
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
			width: leftOffset * (nestedDepth - 1),
			flexShrink: 0,
		};
	}, [leftOffset, nestedDepth]);

	const text =
		sequence.displayName.length > 80
			? sequence.displayName.slice(0, 80) + '...'
			: sequence.displayName;

	const isItemHidden = useMemo(() => {
		return hidden[sequence.id] ?? false;
	}, [hidden, sequence.id]);

	const onToggleVisibility = useCallback(() => {
		setHidden((prev) => {
			const previouslyHidden = prev[sequence.id] ?? false;
			return {
				...prev,
				[sequence.id]: !previouslyHidden,
			};
		});
	}, [sequence.id, setHidden]);

	return (
		<div style={outer}>
			<TimelineLayerEye hidden={isItemHidden} onClick={onToggleVisibility} />
			<div style={padder} />
			{sequence.parent && nestedDepth > 0 ? (
				<>
					<div style={hookContainer}>
						<div style={hookStyle} />
					</div>
					<div style={space} />
				</>
			) : null}
			<div title={text || 'Untitled'} style={textStyle}>
				{text || 'Untitled'}
			</div>
		</div>
	);
};
