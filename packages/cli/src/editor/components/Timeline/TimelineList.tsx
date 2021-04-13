import React from 'react';
import {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {isCollapsed} from './is-collapsed';
import {TimelineActionState, TimelineViewState} from './timeline-state-reducer';
import {TimelineListItem} from './TimelineListItem';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
};

const canCollapse = (track: TrackWithHash, allTracks: TrackWithHash[]) => {
	return !!allTracks.find((t) => t.sequence.parent === track.sequence.id);
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
				if (isCollapsed(track, timeline, viewState)) {
					return null;
				}
				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							hash={track.hash}
							dispatchStateChange={dispatchStateChange}
							collapsed={viewState.collapsed[track.hash]}
							nestedDepth={track.depth}
							sequence={track.sequence}
							beforeDepth={beforeDepth}
							canCollapse={canCollapse(track, timeline)}
						/>
					</div>
				);
			})}
		</div>
	);
};
