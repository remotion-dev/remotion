import {starburst} from '@remotion/effects/starburst';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type RotatingStarburstProps = InteractiveTransformProps & {
	readonly firstColor?: string;
	readonly secondColor?: string;
	readonly rays?: number;
};

const rotatingStarburstSchema = {
	firstColor: {
		type: 'color',
		default: '#dff4ff',
		description: 'First color',
	},
	secondColor: {
		type: 'color',
		default: '#7cc6ff',
		description: 'Second color',
	},
	rays: {
		type: 'number',
		min: 2,
		max: 200,
		step: 1,
		default: 28,
		description: 'Rays',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const RotatingStarburstInner: React.FC<RotatingStarburstProps> = ({
	firstColor = '#dff4ff',
	secondColor = '#7cc6ff',
	rays = 28,
	style,
}) => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			color="#dff4ff"
			width={width}
			height={height}
			effects={[
				starburst({
					rays,
					colors: [firstColor, secondColor],
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
	schema: rotatingStarburstSchema,
	wrapInSequence: true,
});
