import {starburst} from '@remotion/starburst';
import React from 'react';
import {Solid, useCurrentFrame} from 'remotion';

export const RotatingStarburst: React.FC = () => {
	const frame = useCurrentFrame();
	const rotation = (frame * 0.18) % 360;

	return (
		<Solid
			color="#111827"
			width={1920}
			height={1080}
			effects={[
				starburst({
					rays: 28,
					colors: ['#111827', '#f97316', '#fde68a'],
					rotation,
					smoothness: 0.04,
					origin: [0.5, 0.5],
				}),
			]}
		/>
	);
};
