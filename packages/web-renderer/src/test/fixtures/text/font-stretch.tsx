import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				fontFamily: 'sans-serif',
				fontSize: 30,
				padding: 20,
			}}
		>
			<div style={{fontStretch: 'normal'}}>Normal font stretch</div>
			<div style={{fontStretch: '80%'}}>80% font stretch</div>
			<div style={{fontStretch: 'expanded'}}>Expanded font stretch</div>
		</AbsoluteFill>
	);
};

export const fontStretch = {
	component: Component,
	id: 'font-stretch',
	width: 400,
	height: 160,
	fps: 30,
	durationInFrames: 1,
} as const;
