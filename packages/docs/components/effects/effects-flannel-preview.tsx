import {flannel} from '@remotion/effects/flannel';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsFlannelPreview: React.FC<{
	readonly amount: number;
	readonly size: number;
	readonly softness: number;
	readonly baseColor: string;
	readonly stripeColor: string;
}> = ({amount, size, softness, baseColor, stripeColor}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[flannel({amount, size, softness, baseColor, stripeColor})]}
		/>
	);
};
