import {paper} from '@remotion/effects/paper';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	type InteractiveTransformProps,
} from 'remotion';

const PaperTextureInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();

	return (
		<Solid
			style={style}
			color="white"
			width={1920}
			height={1080}
			effects={[
				paper({
					colorFront: 'white',
					colorBack: 'white',
					seed: interpolate(frame, [0, 120], [0, 1000], {
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
	componentName: '<PaperTexture>',
	schema: {},
	wrapInSequence: true,
});
