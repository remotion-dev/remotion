import type {HalftoneShape} from '@remotion/effects/halftone';
import {halftone} from '@remotion/effects/halftone';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsHalftonePreview: React.FC<{
	readonly shape: HalftoneShape;
	readonly dotSize: number;
	readonly dotSpacing: number;
	readonly rotation: number;
	readonly color: string;
	readonly invert: boolean;
}> = ({shape, dotSize, dotSpacing, rotation, color, invert}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[
				halftone({
					shape,
					dotSize,
					dotSpacing,
					rotation,
					color,
					invert,
				}),
			]}
		/>
	);
};
