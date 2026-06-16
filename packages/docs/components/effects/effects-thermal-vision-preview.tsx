import {thermalVision} from '@remotion/effects/thermal-vision';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsThermalVisionPreview: React.FC<{
	readonly amount: number;
	readonly palette: readonly string[];
}> = ({amount, palette}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[thermalVision({amount, palette})]}
		/>
	);
};
