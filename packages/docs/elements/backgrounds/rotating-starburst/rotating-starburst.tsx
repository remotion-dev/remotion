import {starburst} from '@remotion/effects/starburst';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const RotatingStarburstInner: React.FC = () => {
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

export const RotatingStarburst = Interactive.withSchema({
	Component: RotatingStarburstInner,
	componentName: 'RotatingStarburst',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
