import {liquidContours} from '@remotion/effects/liquid-contours';
import React from 'react';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

export const LiquidContours: React.FC = () => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[
				liquidContours({
					phase: interpolate(frame, [0, 240], [3.23, 4.23]),
				}),
			]}
		/>
	);
};
