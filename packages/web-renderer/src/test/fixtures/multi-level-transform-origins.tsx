import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				transform: 'rotate(15deg) scale(0.8)',
				transformOrigin: '25% 25%',
			}}
		>
			<AbsoluteFill
				style={{
					transform: 'rotate(30deg)',
					transformOrigin: '75% 75%',
				}}
			>
				<svg
					viewBox="0 0 100 100"
					width="100"
					height="100"
					style={{
						transform: 'rotate(45deg) scale(1.2)',
						transformOrigin: '10% 90%',
					}}
				>
					<rect x="10" y="10" width="30" height="30" fill="orange" />
					<circle cx="70" cy="70" r="15" fill="blue" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const multiLevelTransformOrigins = {
	component: Component,
	id: 'multi-level-transform-origins',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
