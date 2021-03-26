import React from 'react';
import {TSequence} from 'remotion';
import {
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';

const outer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT,
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	fontSize: 14,
	paddingLeft: TIMELINE_PADDING,
};

export const TimelineListItem: React.FC<{
	sequence: TSequence;
}> = ({sequence}) => {
	return <div style={outer}>{sequence.displayName}</div>;
};
