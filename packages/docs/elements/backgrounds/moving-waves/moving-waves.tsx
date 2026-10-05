import {waves} from '@remotion/effects/waves';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const MovingWavesInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={style} showInTimeline={false}>
			<Solid
				color="#dff4ff"
				width={width}
				height={height}
				effects={[
					waves({
						colors: ['#dff4ff', '#7cc6ff'],
						direction: 'horizontal',
						thickness: 56,
						gap: 0,
						angle: 0,
						offset: (frame / durationInFrames) * 448,
						amplitude: 24,
						wavelength: 160,
						phase: 0,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const MovingWaves = Interactive.withSchema({
	Component: MovingWavesInner,
	componentName: '<MovingWaves>',
	schema: {},
	wrapInSequence: true,
});
