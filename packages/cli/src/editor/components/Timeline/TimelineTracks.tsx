import React, {useMemo} from 'react';
import styled from 'styled-components';
import {Track} from '../../helpers/calculate-timeline';
import {
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {TimelineSequence} from './TimelineSequence';

const TimelineContent = styled.div`
	flex: 1;
	padding-left: ${TIMELINE_PADDING}px;
	padding-right: ${TIMELINE_PADDING}px;
	background-color: #111111;
	width: 100%;
`;

export const TimelineTracks: React.FC<{
	timeline: Track[];
	fps: number;
}> = ({timeline, fps}) => {
	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT + 2,
		};
	}, []);
	return (
		<TimelineContent>
			{timeline.map((track) => (
				<div key={track.sequence.id} style={inner}>
					<TimelineSequence fps={fps} s={track.sequence} />
				</div>
			))}
		</TimelineContent>
	);
};
