import {analogNoise} from '@remotion/effects/analog-noise';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsAnalogNoisePreview: React.FC<{
	readonly phase: number;
	readonly amount: number;
	readonly density: number;
	readonly brightness: number;
	readonly seed: number;
}> = ({phase, amount, density, brightness, seed}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[analogNoise({phase, amount, density, brightness, seed})]}
		/>
	);
};
