import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div
				style={{
					fontSize: 60,
					fontWeight: 'bold',
					background: 'linear-gradient(90deg, #ff0000, #0000ff)',
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					color: 'transparent',
				}}
			>
				Gradient Text
			</div>
		</AbsoluteFill>
	);
};

export const backgroundClipText = {
	component: Component,
	id: 'background-clip-text',
	width: 400,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
