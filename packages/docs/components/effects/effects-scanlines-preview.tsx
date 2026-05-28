import {scanlines} from '@remotion/effects/scanlines';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsScanlinesPreview: React.FC<{
	readonly amount: number;
	readonly spacing: number;
	readonly thickness: number;
	readonly offset: number;
	readonly premultiply: boolean;
}> = ({amount, spacing, thickness, offset, premultiply}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[scanlines({amount, spacing, thickness, offset, premultiply})]}
		/>
	);
};
