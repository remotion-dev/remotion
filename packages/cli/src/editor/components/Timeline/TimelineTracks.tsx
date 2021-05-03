import React, {useMemo} from 'react';
import styled from 'styled-components';
import {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {isTrackHidden} from './is-collapsed';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineViewState} from './timeline-state-reducer';
import {TimelineSequence} from './TimelineSequence';

const Content = styled.div`
	padding-left: ${TIMELINE_PADDING}px;
	padding-right: ${TIMELINE_PADDING}px;
`;

const TimelineContent = styled.div`
	flex: 1;
	background-color: #111111;
	width: 100%;
`;

export const TimelineTracks: React.FC<{
	timeline: TrackWithHash[];
	fps: number;
	viewState: TimelineViewState;
	hasBeenCut: boolean;
}> = ({timeline, fps, viewState, hasBeenCut}) => {
	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2,
		};
	}, []);
	return (
		<TimelineContent>
			<Content>
				{timeline.map((track) => {
					if (isTrackHidden(track, timeline, viewState)) {
						return null;
					}

					return (
						<div key={track.sequence.id} style={inner}>
							<TimelineSequence fps={fps} s={track.sequence} />
						</div>
					);
				})}
			</Content>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</TimelineContent>
	);
};
