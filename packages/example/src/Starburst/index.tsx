import {Starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const StarburstExample: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Starburst
				durationInFrames={60}
				rays={16}
				colors={['#ffdd00', '#ff8800']}
			/>
			<Starburst
				durationInFrames={60}
				rays={12}
				colors={['#ff0066', '#6600ff', '#00ccff']}
				rotation={15}
			/>
		</AbsoluteFill>
	);
};
