import React from 'react';
import {AbsoluteFill} from 'remotion';

const baseStyle: React.CSSProperties = {
	border: '0.8em darkviolet',
	borderStyle: 'dashed',
	margin: '1em 0',
	padding: '1.4em',
	background: 'linear-gradient(60deg, red, yellow, red, yellow, red)',
	fontWeight: 900,
	fontSize: '1.2em',
	fontFamily: 'sans-serif',
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
					backgroundClip: 'border-box',
				}}
			>
				The background extends behind the border.
			</p>
			<p
				style={{
					...baseStyle,
					backgroundClip: 'padding-box',
				}}
			>
				The background extends to the inside edge of the border.
			</p>
			<p
				style={{
					...baseStyle,
					backgroundClip: 'content-box',
				}}
			>
				The background extends only to the edge of the content box.
			</p>
			<p
				style={{
					...baseStyle,
					backgroundClip: 'text',
					WebkitBackgroundClip: 'text',
					color: 'rgba(0, 0, 0, 0.2)',
				}}
			>
				The background is clipped to the foreground text.
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
