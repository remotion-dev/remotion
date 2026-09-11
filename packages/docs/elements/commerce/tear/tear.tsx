import {scale} from '@remotion/effects/scale';
import {tear} from '@remotion/effects/tear';
import React from 'react';
import {
	CanvasImage,
	Easing,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const Tear: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			effects={[
				scale({
					scale: 0.75,
				}),
				tear({
					jaggedness: 24,
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
				fit="cover"
				height={720}
				name="A graphic"
				src="https://remotion.media/elements/commerce-tear-a-graphic.png"
				width={1280}
			/>
		</HtmlInCanvas>
	);
};
