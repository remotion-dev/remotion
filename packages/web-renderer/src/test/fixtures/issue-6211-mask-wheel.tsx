import React from 'react';
import {AbsoluteFill} from 'remotion';

const Wheel: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				height: '100%',
				width: 360,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.125) 100%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					maskImage:
						'linear-gradient(transparent 0%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 70%, transparent 100%)',
				}}
			>
				<AbsoluteFill style={{backgroundColor: 'red'}} />
			</div>
		</div>
	);
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: 'blue',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 40,
					top: 60,
					width: 360,
					transform: 'rotateY(4.8deg)',
				}}
			>
				<div
					style={{
						display: 'flex',
						backgroundColor: 'white',
						height: 200,
						alignItems: 'center',
						position: 'relative',
						overflow: 'hidden',
					}}
				>
					<Wheel />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const issue6211MaskWheel = {
	component: Component,
	id: 'issue-6211-mask-wheel',
	width: 400,
	height: 260,
	fps: 30,
	durationInFrames: 1,
} as const;
