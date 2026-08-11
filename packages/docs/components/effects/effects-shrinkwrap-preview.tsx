import {shrinkwrap} from '@remotion/effects/shrinkwrap';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const SHRINKWRAP_PREVIEW_PARAMS = {
	amount: 0.94,
	displacement: 13.5,
	highlightIntensity: 1.54,
	wrinkleDensity: 0.87,
	edgeTension: 0.58,
	phase: 0,
	seed: 12,
} as const;

export const EffectsShrinkwrapPreview: React.FC<{
	readonly amount: number;
	readonly displacement: number;
	readonly highlightIntensity: number;
	readonly wrinkleDensity: number;
	readonly edgeTension: number;
	readonly phase: number;
	readonly seed: number;
}> = ({
	amount,
	displacement,
	highlightIntensity,
	wrinkleDensity,
	edgeTension,
	phase,
	seed,
}) => {
	return (
		<CanvasImage
			width={1280}
			height={720}
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			effects={[
				shrinkwrap({
					amount,
					displacement,
					highlightIntensity,
					wrinkleDensity,
					edgeTension,
					phase,
					seed,
				}),
			]}
		/>
	);
};
