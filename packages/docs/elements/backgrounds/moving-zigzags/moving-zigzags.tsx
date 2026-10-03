import {zigzag} from '@remotion/effects/zigzag';
import React from 'react';
import {
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
		<Solid
			style={style}
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
	);
};

export const MovingZigzags = Interactive.withSchema({
	Component: MovingZigzagsInner,
	componentName: '<MovingZigzags>',
	schema: {},
	wrapInSequence: true,
});
