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
				<p style={{textTransform: 'none', marginBottom: 10}}>
					None: The Quick Brown Fox Jumps Over the Lazy Dog.
				</p>
				<p style={{textTransform: 'uppercase', marginBottom: 10}}>
					Uppercase: The Quick Brown Fox Jumps Over the Lazy Dog.
				</p>
				<p style={{textTransform: 'lowercase', marginBottom: 10}}>
					Lowercase: The Quick Brown Fox Jumps Over the Lazy Dog.
				</p>
				<p style={{textTransform: 'capitalize', marginBottom: 10}}>
					Capitalize: the quick brown fox jumps over the lazy dog.
				</p>
				<p style={{textTransform: 'capitalize', letterSpacing: '3px'}}>
					Capitalize with spacing: the quick brown fox jumps over the lazy dog.
				</p>
			</div>
		</AbsoluteFill>
	);
};

export const textTransform = {
	component: Component,
	id: 'text-transform',
	width: 550,
	height: 400,
	fps: 30,
	durationInFrames: 100,
} as const;
