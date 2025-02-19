import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LAYER_HEIGHT,
} from '../../helpers/timeline-layout';
import {TimelineLayerEye} from './TimelineLayerEye';
import {TimelineStack} from './TimelineStack';

const SPACING = 5;

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
	readonly sequence: TSequence;
	readonly nestedDepth: number;
	readonly isCompact: boolean;
}> = ({nestedDepth, sequence, isCompact}) => {
	const {hidden, setHidden} = useContext(
		Internals.SequenceVisibilityToggleContext,
	);

	const padder = useMemo((): React.CSSProperties => {
		return {
			width: Number(SPACING * 1.5) * nestedDepth,
			flexShrink: 0,
		};
	}, [nestedDepth]);

	const isItemHidden = useMemo(() => {
		return hidden[sequence.id] ?? false;
	}, [hidden, sequence.id]);

	const onToggleVisibility = useCallback(
		(type: 'enable' | 'disable') => {
			setHidden((prev) => {
				return {
					...prev,
					[sequence.id]: type !== 'enable',
				};
			});
		},
		[sequence.id, setHidden],
	);

	return (
		<div style={outer}>
			<TimelineLayerEye
				type={sequence.type === 'audio' ? 'speaker' : 'eye'}
				hidden={isItemHidden}
				onInvoked={onToggleVisibility}
			/>
			<div style={padder} />
			{sequence.parent && nestedDepth > 0 ? <div style={space} /> : null}
			<TimelineStack sequence={sequence} isCompact={isCompact} />
		</div>
	);
};
