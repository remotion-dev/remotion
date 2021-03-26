import React from 'react';
import {Track} from '../../helpers/calculate-timeline';
import {TimelineListItem} from './TimelineListItem';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
};

export const TimelineList: React.FC<{
	timeline: Track[];
}> = ({timeline}) => {
	return (
		<div style={container}>
			{timeline.map((track, i) => {
				const beforeDepth = i === 0 ? 0 : timeline[i - 1].depth;
				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							nestedDepth={track.depth}
							sequence={track.sequence}
							beforeDepth={beforeDepth}
						/>
					</div>
				);
			})}
		</div>
	);
};
