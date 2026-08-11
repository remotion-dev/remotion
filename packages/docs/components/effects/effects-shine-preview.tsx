import {shine} from '@remotion/effects/shine';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsShinePreview: React.FC<{
	readonly progress: number;
	readonly angle: number;
	readonly haloSigma: number;
	readonly coreSigma: number;
	readonly haloIntensity: number;
	readonly coreIntensity: number;
}> = ({
	progress,
	angle,
	haloSigma,
	coreSigma,
	haloIntensity,
	coreIntensity,
}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				shine({
					progress,
					angle,
					haloSigma,
					coreSigma,
					haloIntensity,
					coreIntensity,
				}),
			]}
		/>
	);
};
