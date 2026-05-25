import {barrelDistortion} from '@remotion/effects/barrel-distortion';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsBarrelDistortionPreview: React.FC<{
	readonly amount: number;
}> = ({amount}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[barrelDistortion({amount})]}
		/>
	);
};
