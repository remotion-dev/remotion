import {starburst} from '@remotion/starburst';
import React from 'react';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

export const RotatingStarburst: React.FC = () => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			color="#dff4ff"
			width={width}
			height={height}
			effects={[
				starburst({
					rays: 28,
					colors: ['#dff4ff', '#7cc6ff'],
					rotation: interpolate(frame, [0, 2000], [0, 360]),
					origin: [0.5, 0.5],
				}),
			]}
		/>
	);
};
