import {emboss} from '@remotion/effects/emboss';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsEmbossPreview: React.FC<{
	readonly amount: number;
	readonly size: number;
	readonly lineWidth: number;
	readonly depth: number;
	readonly angle: number;
	readonly lightAngle: number;
	readonly offset: number;
}> = ({amount, size, lineWidth, depth, angle, lightAngle, offset}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				emboss({
					amount,
					size,
					lineWidth,
					depth,
					angle,
					lightAngle,
					offset,
				}),
			]}
		/>
	);
};
