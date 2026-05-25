import type {
	HalftoneColorMode,
	HalftoneShape,
} from '@remotion/effects/halftone';
import {halftone} from '@remotion/effects/halftone';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsHalftonePreview: React.FC<{
	readonly shape: HalftoneShape;
	readonly dotSize: number;
	readonly dotSpacing: number;
	readonly rotation: number;
	readonly colorMode: HalftoneColorMode;
	readonly dotColor: string;
	readonly invert: boolean;
}> = ({shape, dotSize, dotSpacing, rotation, colorMode, dotColor, invert}) => {
	const colorParams =
		colorMode === 'source'
			? ({colorMode: 'source'} as const)
			: ({colorMode: 'solid', dotColor} as const);

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
					...colorParams,
					invert,
				}),
			]}
		/>
	);
};
