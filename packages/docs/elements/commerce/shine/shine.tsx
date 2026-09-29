import {scale} from '@remotion/effects/scale';
import {shine} from '@remotion/effects/shine';
import React from 'react';
import {
	Interactive,
	CanvasImage,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type ShineProps = InteractiveTransformProps & {
	readonly src?: string;
	readonly angle?: number;
	readonly haloIntensity?: number;
	readonly coreIntensity?: number;
};

const shineSchema = {
	src: {
		type: 'asset',
		assetType: 'image',
		default: 'https://remotion.media/elements/commerce-tear-a-graphic.png',
		description: 'Image',
	},
	angle: {
		type: 'number',
		step: 1,
		default: 30,
		description: 'Shine angle',
		hiddenFromList: false,
	},
	haloIntensity: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: 0.3,
		description: 'Halo intensity',
		hiddenFromList: false,
	},
	coreIntensity: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: 0.4,
		description: 'Core intensity',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const ShineInner: React.FC<ShineProps> = ({
	src = 'https://remotion.media/elements/commerce-tear-a-graphic.png',
	angle = 30,
	haloIntensity = 0.3,
	coreIntensity = 0.4,
	style,
}) => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			effects={[
				scale({scale: 0.75}),
				shine({
					progress: interpolate(frame, [0, 44], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					angle,
					haloSigma: 200,
					coreSigma: 65,
					haloIntensity,
					coreIntensity,
				}),
			]}
			height={720}
			name="Shine"
			width={1280}
		>
			<CanvasImage
				showInTimeline={false}
				fit="cover"
				height={720}
				name="A graphic"
				src={src}
				width={1280}
			/>
		</HtmlInCanvas>
	);
};

export const Shine = Interactive.withSchema({
	Component: ShineInner,
	componentName: '<Shine>',
	schema: shineSchema,
	wrapInSequence: true,
});
