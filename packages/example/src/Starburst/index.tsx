import {Starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const StarburstExample: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Starburst
				durationInFrames={60}
				rays={16}
				color1="#ffdd00"
				color2="#ff8800"
			/>
			<Starburst
				durationInFrames={60}
				rays={8}
				color1="#ff0066"
				color2="#6600ff"
				rotation={22.5}
			/>
		</AbsoluteFill>
	);
};
