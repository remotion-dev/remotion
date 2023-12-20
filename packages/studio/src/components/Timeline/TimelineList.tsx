import React from 'react';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineListItem} from './TimelineListItem';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
};

export const TimelineList: React.FC<{
	timeline: TrackWithHash[];
}> = ({timeline}) => {
	return (
		<div style={container}>
			<TimelineTimePadding />
			{timeline.map((track) => {
				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							hash={track.hash}
							nestedDepth={track.depth}
							sequence={track.sequence}
						/>
					</div>
				);
			})}
		</div>
	);
};
