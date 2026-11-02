import type {LevelsChannel} from '@remotion/effects/levels';
import {levels} from '@remotion/effects/levels';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsLevelsPreview: React.FC<{
	readonly blackPoint: number;
	readonly whitePoint: number;
	readonly gamma: number;
	readonly outputBlack: number;
	readonly outputWhite: number;
	readonly channel: LevelsChannel;
}> = ({blackPoint, whitePoint, gamma, outputBlack, outputWhite, channel}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				levels({
					blackPoint,
					whitePoint,
					gamma,
					outputBlack,
					outputWhite,
					channel,
				}),
			]}
		/>
	);
};
