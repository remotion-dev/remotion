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
					fontSize: 40,
					fontWeight: 'bold',
					WebkitTextFillColor: 'red',
				}}
			>
				Hello
			</div>
		</AbsoluteFill>
	);
};

export const webkitTextFillColor = {
	component: Component,
	id: 'webkit-text-fill-color',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
