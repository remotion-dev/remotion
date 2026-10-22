import {shadowsHighlights} from '@remotion/effects/shadows-highlights';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsShadowsHighlightsPreview: React.FC<{
	readonly shadows: number;
	readonly highlights: number;
}> = ({shadows, highlights}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[shadowsHighlights({shadows, highlights})]}
		/>
	);
};
