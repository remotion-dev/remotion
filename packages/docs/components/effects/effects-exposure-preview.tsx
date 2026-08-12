import {exposure} from '@remotion/effects/exposure';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsExposurePreview: React.FC<{
	readonly stops: number;
}> = ({stops}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[exposure({stops})]}
		/>
	);
};
