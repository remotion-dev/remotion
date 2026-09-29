import {waves} from '@remotion/effects/waves';
import React from 'react';
import {
	Interactive,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type MovingWavesProps = InteractiveTransformProps & {
	readonly firstColor?: string;
	readonly secondColor?: string;
	readonly thickness?: number;
	readonly amplitude?: number;
	readonly wavelength?: number;
};

const movingWavesSchema = {
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
	thickness: {
		type: 'number',
		min: 0.1,
		max: 400,
		step: 0.1,
		default: 56,
		description: 'Thickness',
		hiddenFromList: false,
	},
	amplitude: {
		type: 'number',
		min: 0,
		max: 500,
		step: 0.1,
		default: 24,
		description: 'Amplitude',
		hiddenFromList: false,
	},
	wavelength: {
		type: 'number',
		min: 1,
		max: 2000,
		step: 1,
		default: 160,
		description: 'Wavelength',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const MovingWavesInner: React.FC<MovingWavesProps> = ({
	firstColor = '#dff4ff',
	secondColor = '#7cc6ff',
	thickness = 56,
	amplitude = 24,
	wavelength = 160,
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<Solid
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			color="#dff4ff"
			width={width}
			height={height}
			effects={[
				waves({
					colors: [firstColor, secondColor],
					direction: 'horizontal',
					thickness,
					gap: 0,
					angle: 0,
					offset: (frame / durationInFrames) * 448,
					amplitude,
					wavelength,
					phase: 0,
				}),
			]}
		/>
	);
};

export const MovingWaves = Interactive.withSchema({
	Component: MovingWavesInner,
	componentName: '<MovingWaves>',
	schema: movingWavesSchema,
	wrapInSequence: true,
});
