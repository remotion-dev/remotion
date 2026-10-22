import {scale} from '@remotion/effects/scale';
import {tile} from '@remotion/effects/tile';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsTilePreview: React.FC<{
	readonly horizontal: boolean;
	readonly vertical: boolean;
}> = ({horizontal, vertical}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[scale({scale: 0.36}), tile({horizontal, vertical})]}
		/>
	);
};
