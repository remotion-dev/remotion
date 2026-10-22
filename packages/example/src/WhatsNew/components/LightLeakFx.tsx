import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

// A full-frame light leak that blooms and retracts over the sequence length.
export const LightLeakFx: React.FC<{
	readonly seed?: number;
	readonly hueShift?: number;
}> = ({seed = 0, hueShift = 0}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			style={{mixBlendMode: 'screen'}}
			effects={[
				lightLeak({
					seed,
					hueShift,
					progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}),
			]}
		/>
	);
};
