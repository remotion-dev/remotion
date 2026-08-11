import type {RingsCenter} from '@remotion/effects/rings';
import {rings} from '@remotion/effects/rings';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsRingsPreview: React.FC<{
	readonly colors: readonly string[];
	readonly center: RingsCenter;
	readonly thickness: number;
	readonly gap: number;
	readonly offset: number;
}> = ({colors, center, thickness, gap, offset}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[rings({colors, center, thickness, gap, offset})]}
		/>
	);
};
