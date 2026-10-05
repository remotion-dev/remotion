import {liquidContours} from '@remotion/effects/liquid-contours';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const LiquidContoursInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={style} showInTimeline={false}>
			<Solid
				color="#dff4ff"
				width={width}
				height={height}
				effects={[
					liquidContours({
						firstColor: '#dff4ff',
						secondColor: '#7cc6ff',
						phase: interpolate(frame, [0, durationInFrames], [3.23, 4.23]),
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const LiquidContours = Interactive.withSchema({
	Component: LiquidContoursInner,
	componentName: '<LiquidContours>',
	schema: {},
	wrapInSequence: true,
});
