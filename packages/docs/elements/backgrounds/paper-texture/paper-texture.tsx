import {paper} from '@remotion/effects/paper';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const PaperTextureInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<Solid
			color="white"
			width={width}
			height={height}
			effects={[
				paper({
					colorFront: 'white',
					colorBack: 'white',
					seed: interpolate(frame, [0, durationInFrames], [0, 1000], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						posterize: 30,
					}),
				}),
			]}
		/>
	);
};

export const PaperTexture = Interactive.withSchema({
	Component: PaperTextureInner,
	componentName: 'PaperTexture',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
