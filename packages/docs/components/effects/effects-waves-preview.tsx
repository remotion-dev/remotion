import type {WavesDirection} from '@remotion/effects/waves';
import {waves} from '@remotion/effects/waves';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsWavesPreview: React.FC<{
	readonly direction: WavesDirection;
	readonly thickness: number;
	readonly gap: number;
	readonly angle: number;
	readonly offset: number;
	readonly amplitude: number;
	readonly wavelength: number;
	readonly phase: number;
}> = ({direction, thickness, gap, angle, offset, amplitude, wavelength, phase}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				waves({
					direction,
					thickness,
					gap,
					angle,
					offset,
					amplitude,
					wavelength,
					phase,
				}),
			]}
		/>
	);
};
