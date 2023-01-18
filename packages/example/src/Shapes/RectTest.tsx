import {Rect} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const RectTest: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const spr = spring({
		fps,
		frame,
		config: {},
	});

	const squircleFactor = interpolate(spr, [0, 1], [0, 1.4]);
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<Rect
				debug
				fill="rgba(255, 0, 0, 0.1)"
				squircleFactor={squircleFactor}
				width={200}
				height={400}
			/>
		</AbsoluteFill>
	);
};

export default RectTest;
