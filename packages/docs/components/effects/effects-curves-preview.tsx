import {curves, type CurvePoint} from '@remotion/effects/curves';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsCurvesPreview: React.FC<{
	readonly rgb: readonly CurvePoint[];
	readonly red: readonly CurvePoint[];
	readonly green: readonly CurvePoint[];
	readonly blue: readonly CurvePoint[];
}> = ({rgb, red, green, blue}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[curves({rgb, red, green, blue})]}
		/>
	);
};
