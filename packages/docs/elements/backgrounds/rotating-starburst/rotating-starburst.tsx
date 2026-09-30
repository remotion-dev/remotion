import {starburst} from '@remotion/effects/starburst';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const RotatingStarburstInner: React.FC<InteractiveTransformProps> = ({
	style,
}) => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			style={style}
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
	componentName: '<RotatingStarburst>',
	schema: {},
	wrapInSequence: true,
});
