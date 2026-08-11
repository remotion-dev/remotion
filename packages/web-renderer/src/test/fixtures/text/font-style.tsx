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
				<p style={{fontStyle: 'normal', marginBottom: 10}}>
					Normal style: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{fontStyle: 'italic', marginBottom: 10}}>
					Italic style: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{fontStyle: 'oblique', marginBottom: 10}}>
					Oblique style: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{fontStyle: 'oblique 10deg', marginBottom: 10}}>
					Oblique 10deg: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{fontStyle: 'oblique 20deg'}}>
					Oblique 20deg: The quick brown fox jumps over the lazy dog.
				</p>
			</div>
		</AbsoluteFill>
	);
};

export const fontStyle = {
	component: Component,
	id: 'font-style',
	width: 550,
	height: 400,
	fps: 30,
	durationInFrames: 100,
} as const;
