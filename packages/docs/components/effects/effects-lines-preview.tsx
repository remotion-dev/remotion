import {lines} from '@remotion/effects/lines';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsLinesPreview: React.FC<{
	readonly direction: 'horizontal' | 'vertical';
	readonly thickness: number;
	readonly gap: number;
	readonly angle: number;
	readonly offset: number;
}> = ({direction, thickness, gap, angle, offset}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[lines({direction, thickness, gap, angle, offset})]}
		/>
	);
};
