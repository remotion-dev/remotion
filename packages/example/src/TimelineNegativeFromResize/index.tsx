import {Starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const TimelineNegativeFromResize: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#202020'}}>
			<Sequence
				from={-3}
				durationInFrames={36}
				style={{backgroundColor: 'black'}}
			>
				<Starburst rays={16} colors={['#ffdd00', '#ff8800']} />
			</Sequence>
		</AbsoluteFill>
	);
};
