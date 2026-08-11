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
					backgroundColor: 'purple',
					clipPath: 'inset(20px 30px 40px 10px)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const clipPathInset = {
	component: Component,
	id: 'clip-path-inset',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
