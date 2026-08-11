import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsChromaticAberrationPreview: React.FC<{
	readonly amount: number;
	readonly angle: number;
}> = ({amount, angle}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[chromaticAberration({amount, angle})]}
		/>
	);
};
