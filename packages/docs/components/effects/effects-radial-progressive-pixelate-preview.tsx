import {radialProgressivePixelate} from '@remotion/effects/radial-progressive-pixelate';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const RADIAL_PROGRESSIVE_PIXELATE_PREVIEW_PARAMS = {
	center: [0.48, 0.5],
	width: 1.29,
	height: 1,
	rotation: 0,
	start: 0.55,
	startBlockSize: 1,
	endBlockSize: 64,
} as const;

export const EffectsRadialProgressivePixelatePreview: React.FC<{
	readonly center: readonly [number, number];
	readonly width: number;
	readonly height: number;
	readonly rotation: number;
	readonly start: number;
	readonly startBlockSize: number;
	readonly endBlockSize: number;
}> = ({
	center,
	width,
	height,
	rotation,
	start,
	startBlockSize,
	endBlockSize,
}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				radialProgressivePixelate({
					center,
					width,
					height,
					rotation,
					start,
					startBlockSize,
					endBlockSize,
				}),
			]}
		/>
	);
};
