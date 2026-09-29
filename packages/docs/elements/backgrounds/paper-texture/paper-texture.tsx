import {paper} from '@remotion/effects/paper';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type PaperTextureProps = InteractiveTransformProps & {
	readonly colorFront?: string;
	readonly colorBack?: string;
	readonly amount?: number;
};

const paperTextureSchema = {
	colorFront: {
		type: 'color',
		default: 'white',
		description: 'Front color',
	},
	colorBack: {
		type: 'color',
		default: 'white',
		description: 'Back color',
	},
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Texture amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const PaperTextureInner: React.FC<PaperTextureProps> = ({
	colorFront = 'white',
	colorBack = 'white',
	amount = 1,
	style,
}) => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			color="white"
			width={width}
			height={height}
			effects={[
				paper({
					amount,
					colorFront,
					colorBack,
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
	schema: paperTextureSchema,
	wrapInSequence: true,
});
