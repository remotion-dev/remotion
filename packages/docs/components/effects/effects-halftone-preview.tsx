import {halftone} from '@remotion/effects/halftone';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsHalftonePreview: React.FC = () => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[
				halftone({
					shape: 'circle',
					dotSize: 8,
					dotSpacing: 7,
					rotation: 12,
					color: '#0b84f3',
				}),
			]}
		/>
	);
};
