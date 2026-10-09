import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

export const LightLeakOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps, height, width} = useVideoConfig();

	return (
		<Solid
			name="Light leak"
			width={width}
			height={height}
			premountFor={fps}
			effects={[
				lightLeak({
					seed: 3,
					hueShift: 0,
					progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}),
			]}
		/>
	);
};
