import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const RADIAL_PROGRESSIVE_BLUR_PREVIEW_PARAMS = {
	center: [0.48, 0.5],
	width: 1.29,
	height: 1,
	rotation: 0,
	start: 0.75,
	startBlur: 0,
	endBlur: 200,
} as const;

export const EffectsRadialProgressiveBlurPreview: React.FC<{
	readonly center: readonly [number, number];
	readonly width: number;
	readonly height: number;
	readonly rotation: number;
	readonly start: number;
	readonly startBlur: number;
	readonly endBlur: number;
}> = ({center, width, height, rotation, start, startBlur, endBlur}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				radialProgressiveBlur({
					center,
					width,
					height,
					rotation,
					start,
					startBlur,
					endBlur,
				}),
			]}
		/>
	);
};
