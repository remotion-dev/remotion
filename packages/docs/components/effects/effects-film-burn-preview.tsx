import {filmBurn} from '@remotion/effects/film-burn';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsFilmBurnPreview: React.FC<{
	readonly progress: number;
	readonly center: readonly [number, number];
	readonly seed: number;
}> = ({progress, center, seed}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[filmBurn({progress, center, seed})]}
		/>
	);
};
