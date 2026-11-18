import {magnify, type MagnifyParams} from '@remotion/effects/magnify';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsMagnifyPreview: React.FC<MagnifyParams> = (params) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[magnify(params)]}
		/>
	);
};
