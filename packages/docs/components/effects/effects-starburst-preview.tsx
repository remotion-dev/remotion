import {starburst} from '@remotion/starburst';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const fullSize: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsStarburstPreview: React.FC<{
	readonly rays: number;
	readonly rotation: number;
	readonly smoothness: number;
	readonly origin: readonly [number, number];
}> = ({rays, rotation, smoothness, origin}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			style={fullSize}
			effects={[
				starburst({
					rays,
					colors: ['#dff4ff', '#7cc6ff'],
					rotation,
					smoothness,
					origin,
				}),
			]}
		/>
	);
};
