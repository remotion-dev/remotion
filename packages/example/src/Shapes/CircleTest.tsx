import {Circle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const CircleTest: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const spr = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<Circle
				width={100}
				height={100}
				fill="green"
				stroke="red"
				strokeWidth={1}
			/>
		</AbsoluteFill>
	);
};

export default CircleTest;
