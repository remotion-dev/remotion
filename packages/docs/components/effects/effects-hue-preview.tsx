import {hue} from '@remotion/effects/hue';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsHuePreview: React.FC<{
	readonly degrees: number;
}> = ({degrees}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[hue({degrees})]}
		/>
	);
};
