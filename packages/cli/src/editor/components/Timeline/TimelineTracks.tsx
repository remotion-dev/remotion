import React, {useMemo} from 'react';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {isTrackHidden} from './is-collapsed';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import type {TimelineViewState} from './timeline-state-reducer';
import {TimelineSequence} from './TimelineSequence';
import {
	TimelineTimeIndicators,
	TimelineTimePadding,
} from './TimelineTimeIndicators';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

export const TimelineTracks: React.FC<{
	timeline: TrackWithHash[];
	viewState: TimelineViewState;
	hasBeenCut: boolean;
}> = ({timeline, viewState, hasBeenCut}) => {
	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2,
		};
	}, []);

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
				{timeline.map((track) => {
					if (isTrackHidden(track, timeline, viewState)) {
						return null;
					}

					return (
						<div key={track.sequence.id} style={inner}>
							<TimelineSequence s={track.sequence} />
						</div>
					);
				})}
				<TimelineTimeIndicators />
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};
