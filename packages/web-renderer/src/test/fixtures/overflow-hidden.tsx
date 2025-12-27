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
				}}
			>
				<div
					style={{
						width: 100,
						height: 100,
						backgroundColor: 'orange',
						transform: 'rotate(45deg)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const overflowHidden = {
	component: Component,
	id: 'overflow-hidden',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 100,
} as const;
