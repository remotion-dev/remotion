import {paper} from '@remotion/effects/paper';
import React from 'react';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

export const PaperTexture: React.FC = () => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			color="white"
			width={width}
			height={height}
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
