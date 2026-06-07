import {noiseDisplacement} from '@remotion/effects/noise-displacement';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';

export const NOISE_DISPLACEMENT_TEXT_IMAGE_SRC =
	'img/effects-noise-displacement-text.png';

export const NOISE_DISPLACEMENT_PREVIEW_PARAMS = {
	center: [0.6124309308853857, 0.5010527449123625],
	radius: 0.41,
	strength: 15.5,
	seed: 78,
	grainSize: 0.9,
	passes: 12,
	blur: 0,
	feather: 1,
	biasDirection: 313,
	biasAmount: 1,
} as const;

const container: React.CSSProperties = {
	backgroundColor: 'black',
};

const canvasStyle: React.CSSProperties = {
	scale: 1.83,
};

const textContainer: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
};

const textStyle: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Inter, Arial, Helvetica, system-ui, -apple-system, sans-serif',
	fontSize: 270,
	fontWeight: 900,
	letterSpacing: -15,
	lineHeight: 0.9,
	textAlign: 'center',
};

export const NoiseDisplacementTextSource: React.FC = () => {
	return (
		<AbsoluteFill style={textContainer}>
			<div style={textStyle}>NOISE</div>
		</AbsoluteFill>
	);
};

export const EffectsNoiseDisplacementPreview: React.FC<{
	readonly center: readonly [number, number];
	readonly radius: number;
	readonly strength: number;
	readonly seed: number;
	readonly grainSize: number;
	readonly passes: number;
	readonly blur: number;
	readonly feather: number;
	readonly biasDirection: number;
	readonly biasAmount: number;
}> = ({
	center,
	radius,
	strength,
	seed,
	grainSize,
	passes,
	blur,
	feather,
	biasDirection,
	biasAmount,
}) => {
	return (
		<AbsoluteFill style={container}>
			<CanvasImage
				src={staticFile(NOISE_DISPLACEMENT_TEXT_IMAGE_SRC)}
				width={1280}
				height={720}
				fit="cover"
				style={canvasStyle}
				effects={[
					noiseDisplacement({
						center,
						radius,
						strength,
						seed,
						grainSize,
						passes,
						blur,
						feather,
						biasDirection,
						biasAmount,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
