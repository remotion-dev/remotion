import {burlap} from '@remotion/effects/burlap';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsBurlapPreview: React.FC<{
	readonly amount: number;
	readonly size: number;
	readonly roughness: number;
	readonly seed: number;
	readonly color: string;
}> = ({amount, size, roughness, seed, color}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				burlap({
					amount,
					size,
					roughness,
					seed,
					color,
				}),
			]}
		/>
	);
};
