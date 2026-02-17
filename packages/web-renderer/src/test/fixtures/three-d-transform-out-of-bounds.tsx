import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: -40,
					top: -9999,
					width: 100,
					height: 100,
					backgroundColor: 'red',
					transform: 'rotateY(45deg) rotateX(30deg)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 100,
					height: 100,
					backgroundColor: 'red',
					transform: 'scaleX(-1) rotateY(10deg) rotateX(20deg)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 100,
					height: 100,
					backgroundColor: 'red',
					transform: 'rotateY(90deg)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const threeDTransformOutOfBounds = {
	component: Component,
	id: 'three-d-transform-out-of-bounds',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 100,
} as const;
