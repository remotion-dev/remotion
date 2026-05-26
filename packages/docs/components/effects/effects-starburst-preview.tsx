import {starburst} from '@remotion/starburst';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsStarburstPreview: React.FC<{
	readonly rays: number;
	readonly rotation: number;
	readonly smoothness: number;
	readonly originOffsetX: number;
	readonly originOffsetY: number;
}> = ({rays, rotation, smoothness, originOffsetX, originOffsetY}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				starburst({
					rays,
					colors: ['#ffdd00', '#ff8800'],
					rotation,
					smoothness,
					originOffsetX,
					originOffsetY,
				}),
			]}
		/>
	);
};
