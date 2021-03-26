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
			{timeline.map((track) => {
				return (
					<div key={track.trackId}>
						{track.sequences.map((s) => {
							return <TimelineListItem key={s.id} sequence={s} />;
						})}
					</div>
				);
			})}
		</div>
	);
};
