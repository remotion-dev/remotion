import {noiseDisplacement} from '@remotion/effects/noise-displacement';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

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
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
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
	);
};
