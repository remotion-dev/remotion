import {zoomBlur} from '@remotion/effects/zoom-blur';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsZoomBlurPreview: React.FC<{
	readonly amount: number;
	readonly center: readonly [number, number];
	readonly samples: number;
}> = ({amount, center, samples}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[zoomBlur({amount, center, samples})]}
		/>
	);
};
