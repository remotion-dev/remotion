import {pixelDissolve} from '@remotion/effects/pixel-dissolve';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsPixelDissolvePreview: React.FC<{
	readonly progress: number;
	readonly pixelSize: number;
	readonly seed: number;
	readonly feather: number;
}> = ({progress, pixelSize, seed, feather}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				pixelDissolve({
					progress,
					pixelSize,
					seed,
					feather,
				}),
			]}
		/>
	);
};
