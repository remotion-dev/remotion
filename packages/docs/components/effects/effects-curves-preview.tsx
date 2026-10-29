import type {CurvesParams} from '@remotion/effects/curves';
import {curves} from '@remotion/effects/curves';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsCurvesPreview: React.FC<{
	readonly points: NonNullable<CurvesParams['points']>;
	readonly channel: NonNullable<CurvesParams['channel']>;
	readonly interpolation: NonNullable<CurvesParams['interpolation']>;
	readonly amount: number;
}> = ({points, channel, interpolation, amount}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[curves({points, channel, interpolation, amount})]}
		/>
	);
};
