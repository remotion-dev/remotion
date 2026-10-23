import {shatter, type ShatterParams} from '@remotion/effects/shatter';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsShatterPreview: React.FC<Required<ShatterParams>> = (
	params,
) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[shatter(params)]}
		/>
	);
};
