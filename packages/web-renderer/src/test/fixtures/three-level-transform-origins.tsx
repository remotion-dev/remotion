import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				transform: 'scale(0.9)',
				transformOrigin: '0% 0%',
			}}
		>
			<AbsoluteFill
				style={{
					transform: 'translate(10px, 10px) rotate(20deg)',
					transformOrigin: '50% 0%',
				}}
			>
				<AbsoluteFill
					style={{
						transform: 'rotate(-10deg)',
						transformOrigin: '100% 100%',
					}}
				>
					<svg viewBox="0 0 100 100" width="100" height="100">
						<rect x="20" y="20" width="60" height="60" fill="orange" />
					</svg>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const threeLevelTransformOrigins = {
	component: Component,
	id: 'three-level-transform-origins',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
