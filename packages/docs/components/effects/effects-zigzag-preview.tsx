import {zigzag} from '@remotion/effects/zigzag';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsZigzagPreview: React.FC<{
	readonly colors: readonly string[];
	readonly direction: 'horizontal' | 'vertical';
	readonly thickness: number;
	readonly gap: number;
	readonly angle: number;
	readonly offset: number;
	readonly amplitude: number;
	readonly wavelength: number;
}> = ({
	colors,
	direction,
	thickness,
	gap,
	angle,
	offset,
	amplitude,
	wavelength,
}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[
				zigzag({
					colors,
					direction,
					thickness,
					gap,
					angle,
					offset,
					amplitude,
					wavelength,
				}),
			]}
		/>
	);
};
