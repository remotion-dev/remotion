import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

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
