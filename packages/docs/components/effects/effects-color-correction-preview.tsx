import {
	colorCorrection,
	type ColorCorrectionParams,
} from '@remotion/effects/color-correction';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsColorCorrectionPreview: React.FC<
	Required<ColorCorrectionParams>
> = (params) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[colorCorrection(params)]}
		/>
	);
};
