import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: 150,
					height: 150,
					backgroundColor: 'green',
					clipPath: 'circle(50% at 50% 50%)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const clipPathCircle = {
	component: Component,
	id: 'clip-path-circle',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
