import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 20,
				fontFamily: 'sans-serif',
			}}
		>
			<div style={{width: 350}}>
				<p
					style={{
						fontSize: 32,
						fontWeight: 'bold',
						WebkitTextStroke: '2px black',
						WebkitTextFillColor: 'white',
						marginBottom: 20,
					}}
				>
					Stroke 2px black
				</p>
				<p
					style={{
						fontSize: 32,
						fontWeight: 'bold',
						WebkitTextStrokeWidth: '1px',
						WebkitTextStrokeColor: 'red',
						WebkitTextFillColor: 'yellow',
						marginBottom: 20,
					}}
				>
					Red stroke 1px
				</p>
				<p
					style={{
						fontSize: 32,
						fontWeight: 'bold',
						WebkitTextStroke: '3px blue',
						WebkitTextFillColor: 'transparent',
						marginBottom: 20,
					}}
				>
					Outline only
				</p>
				<p
					style={{
						fontSize: 32,
						fontWeight: 'bold',
						WebkitTextStrokeWidth: '0.5px',
						WebkitTextStrokeColor: 'green',
						marginBottom: 20,
					}}
				>
					Thin green stroke
				</p>
				<p
					style={{
						fontSize: 32,
						fontWeight: 'bold',
						WebkitTextStroke: '4px red',
						WebkitTextFillColor: 'blue',
						paintOrder: 'stroke fill',
						marginBottom: 20,
					}}
				>
					paint-order: stroke fill
				</p>
				<p
					style={{
						fontSize: 32,
						fontWeight: 'bold',
						WebkitTextStroke: '4px red',
						WebkitTextFillColor: 'blue',
						paintOrder: 'fill stroke',
					}}
				>
					paint-order: fill stroke
				</p>
			</div>
		</AbsoluteFill>
	);
};

export const webkitTextStroke = {
	component: Component,
	id: 'webkit-text-stroke',
	width: 400,
	height: 500,
	fps: 30,
	durationInFrames: 1,
} as const;
