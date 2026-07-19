import React from 'react';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineSequenceItem} from './TimelineSequenceItem';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
};

export const TimelineList: React.FC<{
	readonly timeline: TrackWithHash[];
}> = ({timeline}) => {
	return (
		<div style={container}>
			<TimelineTimePadding />
			{timeline.map((track, trackIndex) => {
				return (
					<div key={track.sequence.id}>
						<TimelineSequenceItem
							key={track.sequence.id}
							trackIndex={trackIndex}
							connectedCompositions={track.connectedCompositions ?? []}
							nestedDepth={track.depth}
							sequence={track.sequence}
							nodePathInfo={track.nodePathInfo}
							keyframeDisplayOffset={track.keyframeDisplayOffset}
							sequenceFrameOffset={track.sequenceFrameOffset}
						/>
					</div>
				);
			})}
		</div>
	);
};
