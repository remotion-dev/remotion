import React from 'react';
import {AbsoluteFill} from 'remotion';

const baseStyle: React.CSSProperties = {
	border: '0.8em rgba(0, 0, 0, 0.2)',
	borderStyle: 'solid',
	margin: '1em 0',
	padding: '1.4em',
	background: 'linear-gradient(60deg, red, yellow, red, yellow, red)',
	fontWeight: 900,
	fontSize: '1.2em',
	fontFamily: 'sans-serif',
	borderRadius: 20,
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 20,
				flexDirection: 'column',
			}}
		>
			<p
				style={{
					...baseStyle,
					backgroundClip: 'content-box',
				}}
			>
				The background extends only to the edge of the content box.
			</p>
		</AbsoluteFill>
	);
};

export const backgroundClipText = {
	component: Component,
	id: 'background-clip-text',
	width: 400,
	height: 700,
	fps: 30,
	durationInFrames: 1,
} as const;
