import {
	fractalNoise,
	type FractalNoiseParams,
} from '@remotion/effects/fractal-noise';
import React from 'react';
import {interpolate, Solid, useCurrentFrame} from 'remotion';

export const EffectsFractalNoisePreview: React.FC<
	Required<FractalNoiseParams>
> = ({
	fractalType,
	noiseType,
	scale,
	complexity,
	evolution,
	contrast,
	brightness,
	offsetX,
	offsetY,
	subInfluence,
	subScaling,
	cycleEvolution,
	cycle,
	seed,
	invert,
	amount,
}) => {
	return (
		<Solid
			name="Fractal noise"
			color="black"
			width={1280}
			height={720}
			effects={[
				fractalNoise({
					fractalType,
					noiseType,
					scale,
					complexity,
					evolution,
					contrast,
					brightness,
					offsetX,
					offsetY,
					subInfluence,
					subScaling,
					cycleEvolution,
					cycle,
					seed,
					invert,
					amount,
				}),
			]}
		/>
	);
};

export const FractalNoiseDemo: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Solid
			name="Evolving clouds"
			color="black"
			width={1280}
			height={720}
			effects={[
				fractalNoise({
					scale: 300,
					complexity: 6,
					contrast: 2,
					cycleEvolution: true,
					evolution: interpolate(frame, [0, 180], [0, 360]),
				}),
			]}
		/>
	);
};
