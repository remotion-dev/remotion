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

export const LightLeakOverlay = Interactive.withSchema({
	Component: LightLeakOverlayInner,
	componentName: 'LightLeakOverlay',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
