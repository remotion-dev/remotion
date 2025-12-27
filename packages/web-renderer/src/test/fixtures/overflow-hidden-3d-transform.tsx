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
					width: 100,
					height: 100,
					backgroundColor: 'blue',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					overflow: 'hidden',
					transform: 'rotateY(20deg) rotateX(20deg)',
				}}
			>
				<div
					style={{
						width: 100,
						height: 100,
						backgroundColor: 'orange',
						transform: 'rotate(45deg)',
						scale: 100,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const overflowHidden3dTransform = {
	component: Component,
	id: 'overflow-hidden-3d-transform',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 100,
} as const;
