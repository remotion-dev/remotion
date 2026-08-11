import type {WaveDirection} from '@remotion/effects/wave';
import {wave} from '@remotion/effects/wave';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsWavePreview: React.FC<{
	readonly phase: number;
	readonly amplitude: number;
	readonly wavelength: number;
	readonly direction: WaveDirection;
}> = ({phase, amplitude, wavelength, direction}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[
				wave({
					phase,
					amplitude,
					wavelength,
					direction,
				}),
			]}
		/>
	);
};
