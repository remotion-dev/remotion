import type {
	RadialWipeCenter,
	RadialWipeDirection,
} from '@remotion/effects/radial-wipe';
import {radialWipe} from '@remotion/effects/radial-wipe';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsRadialWipePreview: React.FC<{
	readonly completion: number;
	readonly startAngle: number;
	readonly center: RadialWipeCenter;
	readonly direction: RadialWipeDirection;
	readonly feather: number;
}> = ({completion, startAngle, center, direction, feather}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				radialWipe({completion, startAngle, center, direction, feather}),
			]}
		/>
	);
};
