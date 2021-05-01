import React from 'react';
import {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {isTrackCollapsed} from './is-collapsed';
import {TimelineActionState, TimelineViewState} from './timeline-state-reducer';
import {TimelineListItem} from './TimelineListItem';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
};

export const TimelineList: React.FC<{
	timeline: TrackWithHash[];
	viewState: TimelineViewState;
	dispatchStateChange: React.Dispatch<TimelineActionState>;
}> = ({timeline, viewState, dispatchStateChange}) => {
	return (
		<div style={container}>
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
		</div>
	);
};
