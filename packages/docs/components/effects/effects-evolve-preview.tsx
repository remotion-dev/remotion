import {evolve, type EvolveDirection} from '@remotion/effects/evolve';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsEvolvePreview: React.FC<{
	readonly progress: number;
	readonly direction: EvolveDirection;
	readonly angle: number;
	readonly featherUnit: 'relative' | 'pixels';
	readonly featherPixels: number;
	readonly feather: number;
}> = ({progress, direction, angle, featherUnit, featherPixels, feather}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				evolve({
					progress,
					direction,
					angle,
					featherUnit,
					featherPixels,
					feather,
				}),
			]}
		/>
	);
};
