import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

export const LightLeakOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			style={{mixBlendMode: 'screen'}}
			effects={[
				lightLeak({
					seed: 4,
					hueShift: 20,
					progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}),
			]}
		/>
	);
};
