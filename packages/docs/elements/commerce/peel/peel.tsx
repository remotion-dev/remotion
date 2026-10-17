import {pageTurn} from '@remotion/effects/page-turn';
import {scale} from '@remotion/effects/scale';
import React from 'react';
import {
	CanvasImage,
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const PeelInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<HtmlInCanvas
			effects={[
				scale({scale: 0.75}),
				pageTurn({
					foldPosition: [
						interpolate(frame, [6, durationInFrames - 9], [1.25, -0.45], {
							easing: Easing.inOut(Easing.quad),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						0.5,
					],
					foldDirection: -75,
					foldRadius: 70,
					paperColor: '#ffffff',
					backPageOpacity: 0.1,
				}),
			]}
			height={720}
			name="Peel"
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

export const Peel = Interactive.create({
	Component: PeelInner,
	layout: 'absolute-fill',
});
