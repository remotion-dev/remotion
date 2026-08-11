import {duotone} from '@remotion/effects/duotone';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsDuotonePreview: React.FC<{
	readonly darkColor: string;
	readonly lightColor: string;
	readonly threshold: number;
}> = ({darkColor, lightColor, threshold}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[duotone({darkColor, lightColor, threshold})]}
		/>
	);
};
