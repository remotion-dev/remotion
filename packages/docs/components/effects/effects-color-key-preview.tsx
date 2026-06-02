import {colorKey} from '@remotion/effects/color-key';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsColorKeyPreview: React.FC<{
	readonly color: string;
	readonly threshold: number;
	readonly feather: number;
}> = ({color, threshold, feather}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[colorKey({color, threshold, feather})]}
		/>
	);
};
