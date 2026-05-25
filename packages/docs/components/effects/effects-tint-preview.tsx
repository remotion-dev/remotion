import {tint} from '@remotion/effects/tint';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsTintPreview: React.FC = () => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[tint({color: '#1ec8ff', amount: 0.7})]}
		/>
	);
};
