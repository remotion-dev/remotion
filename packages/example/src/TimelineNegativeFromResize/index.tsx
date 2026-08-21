import {Starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const TimelineNegativeFromResize: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#202020'}} from={-1}>
			<Sequence
				name="Negative start"
				durationInFrames={36}
				style={{backgroundColor: 'black'}}
			>
				<Starburst rays={16} colors={['#ffdd00', '#ff8800']} />
			</Sequence>
			<Sequence name="Zero start" durationInFrames={36}>
				<div />
			</Sequence>
		</AbsoluteFill>
	);
};
