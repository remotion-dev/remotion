import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {LIGHT_COLOR, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LAYER_HEIGHT,
} from '../../helpers/timeline-layout';
import {TimelineLayerEye} from './TimelineLayerEye';

const SPACING = 5;

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

const space: React.CSSProperties = {
	width: SPACING,
	flexShrink: 0,
};

export const TimelineListItem: React.FC<{
	sequence: TSequence;
	nestedDepth: number;
	hash: string;
}> = ({nestedDepth, sequence}) => {
	const {hidden, setHidden} = useContext(
		Internals.SequenceVisibilityToggleContext,
	);

	const padder = useMemo((): React.CSSProperties => {
		return {
			width: Number(SPACING * 1.5) * nestedDepth,
			flexShrink: 0,
		};
	}, [nestedDepth]);

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
			{sequence.parent && nestedDepth > 0 ? <div style={space} /> : null}
			<div title={text || 'Untitled'} style={textStyle}>
				{text || 'Untitled'}
			</div>
		</div>
	);
};
