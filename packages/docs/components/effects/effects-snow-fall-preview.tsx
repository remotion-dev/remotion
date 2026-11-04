import type {SnowFallParams} from '@remotion/effects/snow-fall';
import {snowFall} from '@remotion/effects/snow-fall';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const SNOW_FALL_PREVIEW_PARAMS = {
	time: 1,
	flakes: 1500,
	size: 8,
	sizeVariation: 0.5,
	sceneDepth: 5000,
	speed: 100,
	speedVariation: 0.5,
	wind: 25,
	windVariation: 0.5,
	spread: 0,
	wiggleAmount: 2,
	wiggleAmountVariation: 0.5,
	wiggleFrequency: 1,
	wiggleFrequencyVariation: 0.5,
	color: '#ffffff',
	opacity: 1,
	transferMode: 'composite',
	compositeWithOriginal: true,
	offset: [0.5, 0.5],
	seed: 0,
} as const satisfies Required<SnowFallParams>;

export const EffectsSnowFallPreview: React.FC<Required<SnowFallParams>> = (
	params,
) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[snowFall(params)]}
		/>
	);
};
