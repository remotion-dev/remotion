import type {LinearGradientTintUvCoordinate} from '@remotion/effects/linear-gradient-tint';
import {linearGradientTint} from '@remotion/effects/linear-gradient-tint';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsLinearGradientTintPreview: React.FC<{
	readonly start: LinearGradientTintUvCoordinate;
	readonly end: LinearGradientTintUvCoordinate;
	readonly startColor: string;
	readonly endColor: string;
	readonly amount: number;
}> = ({start, end, startColor, endColor, amount}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				linearGradientTint({
					start,
					end,
					startColor,
					endColor,
					amount,
				}),
			]}
		/>
	);
};
