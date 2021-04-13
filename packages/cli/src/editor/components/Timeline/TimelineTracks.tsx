import React, {useMemo} from 'react';
import styled from 'styled-components';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
	TrackWithHash,
} from '../../helpers/timeline-layout';
import {isCollapsed} from './is-collapsed';
import {TimelineViewState} from './timeline-state-reducer';
import {TimelineSequence} from './TimelineSequence';

const TimelineContent = styled.div`
	flex: 1;
	padding-left: ${TIMELINE_PADDING}px;
	padding-right: ${TIMELINE_PADDING}px;
	background-color: #111111;
	width: 100%;
`;

export const TimelineTracks: React.FC<{
	timeline: TrackWithHash[];
	fps: number;
	viewState: TimelineViewState;
}> = ({timeline, fps, viewState}) => {
	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2,
		};
	}, []);
	return (
		<TimelineContent>
			{timeline.map((track) => {
				if (isCollapsed(track, timeline, viewState)) {
					return null;
				}
				return (
					<div key={track.sequence.id} style={inner}>
						<TimelineSequence fps={fps} s={track.sequence} />
					</div>
				);
			})}
		</TimelineContent>
	);
};
