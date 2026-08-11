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
					transform: 'rotateX(15deg) rotateY(15deg)',
				}}
			>
				<p
					style={{
						border: '0.8em rgba(0, 0, 0, 0.2)',
						borderStyle: 'solid',
						margin: '1em 0',
						padding: '1.4em',
						background: 'linear-gradient(60deg, red, yellow, red, yellow, red)',
						fontWeight: 900,
						fontSize: '1.2em',
						fontFamily: 'sans-serif',
						borderRadius: 20,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						color: 'rgba(0, 0, 0, 0.2)',
					}}
				>
					The background is clipped to the foreground text.
				</p>
			</div>
		</AbsoluteFill>
	);
};

export const backgroundClipText3dTransform = {
	component: Component,
	id: 'background-clip-text-3d-transform',
	width: 400,
	height: 300,
	fps: 30,
	durationInFrames: 1,
} as const;
