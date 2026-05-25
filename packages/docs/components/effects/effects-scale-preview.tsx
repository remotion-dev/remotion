import {scale} from '@remotion/effects/scale';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsScalePreview: React.FC<{
	readonly scale: number;
	readonly horizontal: boolean;
	readonly vertical: boolean;
}> = ({scale: scaleValue, horizontal, vertical}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[scale({scale: scaleValue, horizontal, vertical})]}
		/>
	);
};
