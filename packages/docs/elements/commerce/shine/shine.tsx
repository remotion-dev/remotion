import {scale} from '@remotion/effects/scale';
import {shine} from '@remotion/effects/shine';
import React from 'react';
import {
	Interactive,
	CanvasImage,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const ShineInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<HtmlInCanvas
			effects={[
				scale({scale: 0.75}),
				shine({
					progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					angle: 30,
					haloSigma: 200,
					coreSigma: 65,
					haloIntensity: 0.3,
					coreIntensity: 0.4,
				}),
			]}
			height={720}
			name="Shine"
			width={1280}
		>
			<CanvasImage
				fit="cover"
				height={720}
				name="A graphic"
				src="https://remotion.media/elements/commerce-tear-a-graphic.png"
				width={1280}
			/>
		</HtmlInCanvas>
	);
};

export const Shine = Interactive.withSchema({
	Component: ShineInner,
	componentName: '<Shine>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
