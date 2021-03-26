import React, {useMemo} from 'react';
import {TSequence} from 'remotion';
import {
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';

const BORDER_BOTTOM_LEFT_RADIUS = 7;

const outer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT,
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	fontSize: 14,
	paddingLeft: TIMELINE_PADDING,
};

const hookContainer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT,
	width: 10,
	position: 'relative',
};

const hook: React.CSSProperties = {
	borderLeft: '1px solid white',
	borderBottom: '1px solid white',
	borderBottomLeftRadius: BORDER_BOTTOM_LEFT_RADIUS,
	height: TIMELINE_LAYER_HEIGHT + BORDER_BOTTOM_LEFT_RADIUS / 2 + 2,
	width: 10,
	position: 'absolute',
	bottom: TIMELINE_LAYER_HEIGHT / 2 - 1,
};

const space: React.CSSProperties = {
	width: 5,
};

export const TimelineListItem: React.FC<{
	sequence: TSequence;
}> = ({sequence}) => {
	const leftOffset = sequence.parent ? 7 : 0;

	const padder = useMemo((): React.CSSProperties => {
		return {
			width: leftOffset,
		};
	}, [leftOffset]);

	return (
		<div style={outer}>
			<div style={padder} />
			{sequence.parent ? (
				<div style={hookContainer}>
					<div style={hook} />
				</div>
			) : null}
			<div style={space} />
			{sequence.displayName}
		</div>
	);
};
