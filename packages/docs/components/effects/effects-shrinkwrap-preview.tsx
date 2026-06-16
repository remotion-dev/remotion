import {shrinkwrap} from '@remotion/effects/shrinkwrap';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const SHRINKWRAP_PREVIEW_PARAMS = {
	amount: 1,
	displacement: 6.5,
	highlightIntensity: 1.1,
	wrinkleDensity: 0.62,
	edgeTension: 0.72,
	seed: 8,
} as const;

export const EffectsShrinkwrapPreview: React.FC<{
	readonly amount: number;
	readonly displacement: number;
	readonly highlightIntensity: number;
	readonly wrinkleDensity: number;
	readonly edgeTension: number;
	readonly seed: number;
}> = ({
	amount,
	displacement,
	highlightIntensity,
	wrinkleDensity,
	edgeTension,
	seed,
}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				shrinkwrap({
					amount,
					displacement,
					highlightIntensity,
					wrinkleDensity,
					edgeTension,
					seed,
				}),
			]}
		/>
	);
};
