import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsDropShadowPreview: React.FC<{
	readonly radius: number;
	readonly offsetX: number;
	readonly offsetY: number;
	readonly opacity: number;
	readonly color: string;
}> = ({radius, offsetX, offsetY, opacity, color}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				scale({scale: 0.82}),
				dropShadow({
					radius,
					offsetX,
					offsetY,
					opacity,
					color,
				}),
			]}
		/>
	);
};
