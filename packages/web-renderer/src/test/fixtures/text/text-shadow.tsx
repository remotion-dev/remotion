import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 20,
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
			}}
		>
			{/* Simple text shadow */}
			<div
				style={{
					fontSize: 30,
					fontWeight: 'bold',
					textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
				}}
			>
				Shadow
			</div>

			{/* Colored text shadow */}
			<div
				style={{
					fontSize: 30,
					fontWeight: 'bold',
					color: 'blue',
					textShadow: '3px 3px 0px red',
				}}
			>
				Color
			</div>

			{/* Multiple text shadows */}
			<div
				style={{
					fontSize: 30,
					fontWeight: 'bold',
					textShadow:
						'1px 1px 2px red, 0 0 10px blue, 0 0 20px rgba(0, 0, 255, 0.3)',
				}}
			>
				Multi
			</div>

			{/* Text shadow with no blur */}
			<div
				style={{
					fontSize: 30,
					fontWeight: 'bold',
					textShadow: '2px 2px 0 black',
				}}
			>
				Hard
			</div>

			{/* Text shadow with glow effect */}
			<div
				style={{
					fontSize: 30,
					fontWeight: 'bold',
					color: 'white',
					backgroundColor: '#333',
					padding: 10,
					textShadow: '0 0 10px white, 0 0 20px white',
				}}
			>
				Glow
			</div>
		</AbsoluteFill>
	);
};

export const textShadow = {
	component: Component,
	id: 'text-shadow',
	width: 300,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
