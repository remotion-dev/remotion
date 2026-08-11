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
					backgroundColor: 'orange',
					clipPath: 'ellipse(40% 30% at 50% 50%)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const clipPathEllipse = {
	component: Component,
	id: 'clip-path-ellipse',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
