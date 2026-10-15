import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const LightLeakOverlayInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<Solid
			name="Light leak"
			width={width}
			height={height}
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

export const LightLeakOverlay = Interactive.create({
	Component: LightLeakOverlayInner,
	layout: 'absolute-fill',
});
