import {whiteNoise} from '@remotion/effects/white-noise';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsWhiteNoisePreview: React.FC<{
	readonly amount: number;
	readonly seed: number;
}> = ({amount, seed}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[whiteNoise({amount, seed})]}
		/>
	);
};
