import {evolve} from '@remotion/effects/evolve';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsEvolvePreview: React.FC<{
	readonly progress: number;
	readonly direction: 'left' | 'right' | 'top' | 'bottom';
	readonly feather: number;
}> = ({progress, direction, feather}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[evolve({progress, direction, feather})]}
		/>
	);
};
