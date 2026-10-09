import {liquidContours} from '@remotion/effects/liquid-contours';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const LiquidContoursInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
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
	);
};

export const LiquidContours = Interactive.withSchema({
	Component: LiquidContoursInner,
	componentName: 'LiquidContours',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
