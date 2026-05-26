import {glow} from '@remotion/effects/glow';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsGlowPreview: React.FC<{
	readonly radius: number;
	readonly intensity: number;
	readonly threshold: number;
	readonly color: string;
}> = ({radius, intensity, threshold, color}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				glow({
					radius,
					intensity,
					threshold,
					color,
				}),
			]}
		/>
	);
};
