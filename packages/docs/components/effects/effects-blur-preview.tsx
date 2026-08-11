import {blur} from '@remotion/effects/blur';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsBlurPreview: React.FC<{
	readonly radius: number;
	readonly horizontal: boolean;
	readonly vertical: boolean;
}> = ({radius, horizontal, vertical}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[blur({radius, horizontal, vertical})]}
		/>
	);
};
