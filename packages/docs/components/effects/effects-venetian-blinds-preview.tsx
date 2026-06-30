import {venetianBlinds} from '@remotion/effects/venetian-blinds';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsVenetianBlindsPreview: React.FC<{
	readonly progress: number;
	readonly direction: 'vertical' | 'horizontal';
	readonly slats: number;
}> = ({progress, direction, slats}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[venetianBlinds({progress, direction, slats})]}
		/>
	);
};
