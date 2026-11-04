import type {RainFallParams} from '@remotion/effects/rain-fall';
import {rainFall} from '@remotion/effects/rain-fall';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const RAIN_FALL_PREVIEW_PARAMS = {
	time: 1,
	drops: 100000,
	size: 2,
	sceneDepth: 5000,
	speed: 4000,
	wind: 200,
	windVariation: 0,
	spread: 0,
	color: '#cccccc',
	opacity: 0.5,
	transferMode: 'lighten',
	compositeWithOriginal: true,
	appearance: 'refracting',
	offset: [0.5, 0.5],
	seed: 0,
} as const satisfies Required<RainFallParams>;

export const EffectsRainFallPreview: React.FC<Required<RainFallParams>> = (
	params,
) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[rainFall(params)]}
		/>
	);
};
