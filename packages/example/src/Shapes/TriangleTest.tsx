import {Triangle} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const TriangleTest: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const spr = spring({
		fps,
		frame,
		config: {},
	});

	const edgeRoundness = interpolate(spr, [0, 1], [0, 1]);

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
			}}
		>
			<Triangle
				debug
				edgeRoundness={edgeRoundness}
				length={100}
				direction="up"
			/>
		</AbsoluteFill>
	);
};

export default TriangleTest;
