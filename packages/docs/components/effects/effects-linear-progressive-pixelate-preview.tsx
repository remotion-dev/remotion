import {linearProgressivePixelate} from '@remotion/effects/linear-progressive-pixelate';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const LINEAR_PROGRESSIVE_PIXELATE_PREVIEW_PARAMS = {
	start: [0.1, 0.5],
	end: [0.9, 0.5],
	startBlockSize: 1,
	endBlockSize: 64,
} as const;

export const EffectsLinearProgressivePixelatePreview: React.FC<{
	readonly start: readonly [number, number];
	readonly end: readonly [number, number];
	readonly startBlockSize: number;
	readonly endBlockSize: number;
}> = ({start, end, startBlockSize, endBlockSize}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				linearProgressivePixelate({
					start,
					end,
					startBlockSize,
					endBlockSize,
				}),
			]}
		/>
	);
};
