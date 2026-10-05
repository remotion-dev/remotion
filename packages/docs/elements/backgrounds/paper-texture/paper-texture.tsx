import {paper} from '@remotion/effects/paper';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const PaperTextureInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={style} showInTimeline={false}>
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
		</AbsoluteFill>
	);
};

export const PaperTexture = Interactive.withSchema({
	Component: PaperTextureInner,
	componentName: '<PaperTexture>',
	schema: {},
	wrapInSequence: true,
});
