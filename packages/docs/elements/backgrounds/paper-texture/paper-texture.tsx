import {paper} from '@remotion/effects/paper';
import React from 'react';
import {interpolate, Solid, useCurrentFrame} from 'remotion';

export const PaperTexture: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Solid
			color="white"
			effects={[
				paper({
					colorFront: 'white',
					colorBack: 'white',
					seed: interpolate(frame, [0, 120], [0, 1000], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						posterize: 30,
					}),
				}),
			]}
		/>
	);
};
