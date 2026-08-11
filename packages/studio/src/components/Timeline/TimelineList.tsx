import React, {useMemo} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {
	nestTimelineTracks,
	type NestedTimelineTrack,
} from './nest-timeline-tracks';
import {TimelineSequenceItem} from './TimelineSequenceItem';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
};

const TimelineListTrack: React.FC<{
	readonly nestedTrack: NestedTimelineTrack<TimelineTrackData>;
}> = ({nestedTrack}) => {
	const {track, children, siblingIndex} = nestedTrack;

	return (
		<div>
			<TimelineSequenceItem
				siblingIndex={siblingIndex}
				connectedCompositions={track.connectedCompositions ?? []}
				nestedDepth={track.depth}
				sequence={track.sequence}
				nodePathInfo={track.nodePathInfo}
				keyframeDisplayOffset={track.keyframeDisplayOffset}
				sequenceFrameOffset={track.sequenceFrameOffset}
			>
				{children.map((child) => (
					<TimelineListTrack
						key={child.track.sequence.id}
						nestedTrack={child}
					/>
				))}
			</TimelineSequenceItem>
		</div>
	);
};

export const TimelineList: React.FC<{
	readonly timeline: TimelineTrackData[];
	readonly showTimePadding: boolean;
}> = ({timeline, showTimePadding}) => {
	const nestedTimeline = useMemo(
		() => nestTimelineTracks(timeline),
		[timeline],
	);

	return (
		<div style={container}>
			{showTimePadding ? <TimelineTimePadding /> : null}
			{nestedTimeline.map((nestedTrack) => (
				<TimelineListTrack
					key={nestedTrack.track.sequence.id}
					nestedTrack={nestedTrack}
				/>
			))}
		</div>
	);
};
