import {lut} from '@remotion/effects/lut';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const LUT_PREVIEW_CONTENT = `TITLE "Teal and orange"
LUT_3D_SIZE 2

0.02 0.05 0.08
0.95 0.12 0.06
0.02 0.8 0.4
1 0.9 0.18
0.08 0.18 0.9
0.95 0.2 0.75
0.15 0.88 0.92
1 0.92 0.78`;

export const EffectsLutPreview: React.FC<{
	readonly content: string;
}> = ({content}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[lut({content})]}
		/>
	);
};
