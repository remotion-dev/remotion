import {zigzag} from '@remotion/effects/zigzag';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const MovingZigzagsInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={style} showInTimeline={false}>
			<Solid
				color="#dff4ff"
				width={width}
				height={height}
				effects={[
					zigzag({
						colors: ['#dff4ff', '#7cc6ff'],
						direction: 'horizontal',
						thickness: 40,
						gap: 0,
						angle: 0,
						offset: (frame / durationInFrames) * 480,
						amplitude: 40,
						wavelength: 160,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const MovingZigzags = Interactive.withSchema({
	Component: MovingZigzagsInner,
	componentName: '<MovingZigzags>',
	schema: {},
	wrapInSequence: true,
});
