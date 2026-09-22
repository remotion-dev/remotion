import {scale} from '@remotion/effects/scale';
import {tear} from '@remotion/effects/tear';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsTearPreview: React.FC<{
	readonly angle: number;
	readonly progress: number;
	readonly rotation: number;
	readonly jaggedness: number;
}> = ({progress, rotation, jaggedness, angle}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				scale({scale: 0.7}),
				tear({progress, rotation, jaggedness, angle}),
			]}
		/>
	);
};
