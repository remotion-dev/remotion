import React from 'react';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {isTrackCollapsed} from './is-collapsed';
import type {
	TimelineActionState,
	TimelineViewState,
} from './timeline-state-reducer';
import {TimelineListItem} from './TimelineListItem';
import {
	TimelineTimePadding,
	TimelineTimePlaceholders,
} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	background: BACKGROUND,
};

export const TimelineList: React.FC<{
	timeline: TrackWithHash[];
	viewState: TimelineViewState;
	dispatchStateChange: React.Dispatch<TimelineActionState>;
}> = ({timeline, viewState, dispatchStateChange}) => {
	return (
		<div style={container}>
			<TimelineTimePadding />

			{timeline.map((track, i) => {
				const beforeDepth = i === 0 ? 0 : timeline[i - 1].depth;

				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							hash={track.hash}
							dispatchStateChange={dispatchStateChange}
							collapsed={isTrackCollapsed(track.hash, viewState)}
							nestedDepth={track.depth}
							sequence={track.sequence}
							beforeDepth={beforeDepth}
							canCollapse={track.canCollapse}
						/>
					</div>
				);
			})}
			<TimelineTimePlaceholders />
		</div>
	);
};
