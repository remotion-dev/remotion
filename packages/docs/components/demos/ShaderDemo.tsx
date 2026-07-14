import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const ShaderDemoComp: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			color="black"
			effects={[
				halftoneLinearGradient({
					firstStopDotSize: 0,
					secondStopDotSize: 42,
					firstStopPosition: [0, 0.5],
					secondStopPosition: [1, 0.5],
					gridSize: 24,
					dotColor: '#0b84f3',
				}),
			]}
		/>
	);
};
