import {lightning, type LightningParams} from '@remotion/effects/lightning';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const LIGHTNING_PREVIEW_PARAMS = {
	origin: [0.5, 0],
	direction: [0.5, 0.9],
} as const satisfies LightningParams;

export const EffectsLightningPreview: React.FC<LightningParams> = (params) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[lightning(params)]}
		/>
	);
};
