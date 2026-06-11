import {lines} from '@remotion/effects/lines';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsLinesPreview: React.FC<{
	readonly colors: readonly string[];
	readonly direction: 'horizontal' | 'vertical';
	readonly thickness: number;
	readonly gap: number;
	readonly angle: number;
	readonly offset: number;
}> = ({colors, direction, thickness, gap, angle, offset}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[lines({colors, direction, thickness, gap, angle, offset})]}
		/>
	);
};
