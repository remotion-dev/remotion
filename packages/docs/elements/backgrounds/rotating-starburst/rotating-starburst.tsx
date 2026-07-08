import {starburst} from '@remotion/starburst';
import React from 'react';
import {interpolate, Solid, useCurrentFrame} from 'remotion';

export const RotatingStarburst: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Solid
			color="#111827"
			width={1920}
			height={1080}
			effects={[
				starburst({
					rays: 28,
					colors: ['#111827', '#f97316'],
					rotation: interpolate(frame, [0, 2000], [0, 360]),
					origin: [0.5, 0.5],
				}),
			]}
		/>
	);
};
