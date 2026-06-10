import type {WavesDirection} from '@remotion/effects/waves';
import {waves} from '@remotion/effects/waves';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsWavesPreview: React.FC<{
	readonly colors: readonly string[];
	readonly direction: WavesDirection;
	readonly thickness: number;
	readonly gap: number;
	readonly angle: number;
	readonly offset: number;
	readonly amplitude: number;
	readonly wavelength: number;
	readonly phase: number;
}> = ({
	colors,
	direction,
	thickness,
	gap,
	angle,
	offset,
	amplitude,
	wavelength,
	phase,
}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[
				waves({
					colors,
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
