import {tint} from '@remotion/effects/tint';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsTintPreview: React.FC<{
	readonly color: string;
	readonly amount: number;
}> = ({color, amount}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[tint({color, amount})]}
		/>
	);
};
