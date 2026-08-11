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
					backgroundColor: 'red',
					clipPath: 'path("M 75 0 L 150 150 L 0 150 Z")',
				}}
			/>
		</AbsoluteFill>
	);
};

export const clipPathPath = {
	component: Component,
	id: 'clip-path-path',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
