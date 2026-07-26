import {starburst} from '@remotion/effects/starburst';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const StarburstDemoComp: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Solid
				width={width}
				height={height}
				effects={[
					starburst({
						rays: 16,
						colors: ['#ffdd00', '#ff8800'],
						rotation: interpolate(frame, [0, 45, 89], [0, 180, 360]),
						smoothness: interpolate(frame, [0, 45, 89], [0, 0.3, 0]),
						origin: [0.5, 0.5],
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
