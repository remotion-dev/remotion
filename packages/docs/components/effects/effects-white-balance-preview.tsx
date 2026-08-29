import {whiteBalance} from '@remotion/effects/white-balance';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsWhiteBalancePreview: React.FC<{
	readonly temperature: number;
	readonly tint: number;
}> = ({temperature, tint}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[whiteBalance({temperature, tint})]}
		/>
	);
};
