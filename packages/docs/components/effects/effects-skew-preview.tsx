import {skew} from '@remotion/effects/skew';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsSkewPreview: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly origin: readonly [number, number];
}> = ({x, y, origin}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[skew({x, y, origin})]}
		/>
	);
};
