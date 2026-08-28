import {Starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const TimelineNegativeFromResize: React.FC = () => {
	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#202020'}}>
				<Sequence
					name="Negative start"
					from={-20}
					durationInFrames={21}
					freeze={20}
					style={{backgroundColor: 'black'}}
				>
					<Starburst rays={16} colors={['#ffdd00', '#ff8800']} />
				</Sequence>
				<Sequence
					name="Negative start without freeze"
					from={-20}
					durationInFrames={21}
				>
					<div />
				</Sequence>
			</AbsoluteFill>
			<Sequence name="Zero start" durationInFrames={36}>
				<div />
			</Sequence>
		</>
	);
};
