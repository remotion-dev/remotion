import {speckle} from '@remotion/effects/speckle';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsSpecklePreview: React.FC<{
	readonly density: number;
	readonly size: number;
	readonly randomness: number;
}> = ({density, size, randomness}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				speckle({
					density,
					size,
					randomness,
				}),
			]}
		/>
	);
};
