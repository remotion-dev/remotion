import React from 'react';
import {BACKGROUND, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineListItem} from './TimelineListItem';
import {
	TimelineTimePadding,
	TimelineTimePlaceholders,
} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
};

const topSeparator: React.CSSProperties = {
	borderBottom: '1px solid ' + TIMELINE_TRACK_SEPARATOR,
};

export const TimelineList: React.FC<{
	timeline: TrackWithHash[];
}> = ({timeline}) => {
	return (
		<div style={container}>
			<TimelineTimePadding />
			<div style={topSeparator} />
			{timeline.map((track, i) => {
				const beforeDepth = i === 0 ? 0 : timeline[i - 1].depth;
				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							hash={track.hash}
							nestedDepth={track.depth}
							sequence={track.sequence}
							beforeDepth={beforeDepth}
						/>
					</div>
				);
			})}
			<TimelineTimePlaceholders />
		</div>
	);
};
