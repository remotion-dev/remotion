import {scale} from '@remotion/effects/scale';
import {tear} from '@remotion/effects/tear';
import React from 'react';
import {
	Interactive,
	CanvasImage,
	Easing,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type TearProps = InteractiveTransformProps & {
	readonly src?: string;
	readonly jaggedness?: number;
};

const tearSchema = {
	src: {
		type: 'asset',
		assetType: 'image',
		default: 'https://remotion.media/elements/commerce-tear-a-graphic.png',
		description: 'Image',
	},
	jaggedness: {
		type: 'number',
		min: 0,
		step: 1,
		default: 24,
		description: 'Jaggedness',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const TearInner: React.FC<TearProps> = ({
	src = 'https://remotion.media/elements/commerce-tear-a-graphic.png',
	jaggedness = 24,
	style,
}) => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			effects={[
				scale({
					scale: 0.75,
				}),
				tear({
					jaggedness,
					progress: interpolate(frame, [15, 25], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					}),
					rotation: interpolate(frame, [15, 25], [0, 5], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					}),
				}),
			]}
			height={720}
			name="Tear"
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

export const Tear = Interactive.withSchema({
	Component: TearInner,
	componentName: '<Tear>',
	schema: tearSchema,
	wrapInSequence: true,
});
