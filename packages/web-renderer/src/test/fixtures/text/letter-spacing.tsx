import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 20,
			}}
		>
			<div style={{width: 550}}>
				<p style={{letterSpacing: '0px', marginBottom: 10}}>
					Normal spacing: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{letterSpacing: '2px', marginBottom: 10}}>
					2px spacing: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{letterSpacing: '5px', marginBottom: 10}}>
					5px spacing: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{letterSpacing: '10px', marginBottom: 10}}>
					10px spacing: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{letterSpacing: '-1px'}}>
					-1px spacing: The quick brown fox jumps over the lazy dog.
				</p>
			</div>
		</AbsoluteFill>
	);
};

export const letterSpacing = {
	component: Component,
	id: 'letter-spacing',
	width: 550,
	height: 400,
	fps: 30,
	durationInFrames: 100,
} as const;
