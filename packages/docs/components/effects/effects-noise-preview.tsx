import {noise} from '@remotion/effects/noise';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsNoisePreview: React.FC<{
	readonly amount: number;
	readonly seed: number;
	readonly premultiply: boolean;
}> = ({amount, seed, premultiply}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[noise({amount, seed, premultiply})]}
		/>
	);
};
