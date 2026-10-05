import {starburst} from '@remotion/effects/starburst';
import React from 'react';
import {
	AbsoluteFill,
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
		<AbsoluteFill style={style} showInTimeline={false}>
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
		</AbsoluteFill>
	);
};

export const RotatingStarburst = Interactive.withSchema({
	Component: RotatingStarburstInner,
	componentName: '<RotatingStarburst>',
	schema: {},
	wrapInSequence: true,
});
