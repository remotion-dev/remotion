import {lines} from '@remotion/effects/lines';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsLinesPreview: React.FC<{
	readonly direction: 'horizontal' | 'vertical';
	readonly thickness: number;
	readonly gap: number;
	readonly angle: number;
	readonly offset: number;
}> = ({direction, thickness, gap, angle, offset}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[lines({direction, thickness, gap, angle, offset})]}
		/>
	);
};
