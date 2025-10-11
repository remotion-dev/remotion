import React, {useMemo} from 'react';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineSequence} from './TimelineSequence';
import {TimelineTimePadding} from './TimelineTimeIndicators';
import {isTrackHidden} from './is-collapsed';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
	paddingTop: 1,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

export const TimelineTracks: React.FC<{
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
				{timeline.map((track) => {
					if (isTrackHidden(track)) {
						return null;
					}

					return (
						<div
							key={track.sequence.id}
							style={{
								height: getTimelineLayerHeight(
									track.sequence.type === 'video' ? 'video' : 'other',
								),
								marginBottom: TIMELINE_ITEM_BORDER_BOTTOM,
							}}
						>
							<TimelineSequence s={track.sequence} />
						</div>
					);
				})}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};
