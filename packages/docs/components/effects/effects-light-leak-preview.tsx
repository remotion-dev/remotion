import {lightLeak} from '@remotion/light-leaks';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsLightLeakPreview: React.FC<{
	readonly seed: number;
	readonly hueShift: number;
	readonly progress: number;
}> = ({seed, hueShift, progress}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[
				lightLeak({
					seed,
					hueShift,
					progress,
				}),
			]}
		/>
	);
};
