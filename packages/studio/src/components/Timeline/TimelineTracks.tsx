import React, {useMemo} from 'react';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineTimePadding} from './TimelineTimeIndicators';
import {TimelineTrack} from './TimelineTrack';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const TimelineTracksInner: React.FC<{
	readonly timeline: TrackWithHash[];
	readonly hasBeenCut: boolean;
}> = ({timeline, hasBeenCut}) => {
	const timelineStyle: React.CSSProperties = useMemo(() => {
		return {
			...timelineContent,
			width: 100 + '%',
		};
	}, []);

	return (
		<div style={timelineStyle}>
			<div style={content}>
				<TimelineTimePadding />
				{timeline.map((track) => (
					<TimelineTrack key={track.sequence.id} track={track} />
				))}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};

export const TimelineTracks = React.memo(TimelineTracksInner);
