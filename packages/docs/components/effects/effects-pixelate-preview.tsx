import {pixelate} from '@remotion/effects/pixelate';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsPixelatePreview: React.FC<{
	readonly blockSize: number;
}> = ({blockSize}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				pixelate({
					blockSize,
				}),
			]}
		/>
	);
};
