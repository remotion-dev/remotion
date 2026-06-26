import React from 'react';
import {AbsoluteFill} from 'remotion';

const row: React.CSSProperties = {
	fontFamily: 'Arial, sans-serif',
	fontSize: 38,
	fontWeight: 700,
	lineHeight: 1.45,
	margin: 0,
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				color: '#1d2330',
				justifyContent: 'center',
				padding: 32,
			}}
		>
			<p
				style={{
					...row,
					textDecorationLine: 'underline',
				}}
			>
				Underlined text
			</p>
			<p
				style={{
					...row,
					textDecorationLine: 'overline',
					textDecorationColor: '#2b9a66',
					textDecorationThickness: 5,
				}}
			>
				Green overline
			</p>
			<p
				style={{
					...row,
					textDecorationLine: 'line-through',
					textDecorationColor: '#d13131',
					textDecorationThickness: 4,
				}}
			>
				Line-through
			</p>
			<p
				style={{
					...row,
					color: '#623aa2',
					textDecorationLine: 'underline overline line-through',
					textDecorationThickness: 3,
				}}
			>
				Combined lines
			</p>
			<p
				dir="rtl"
				style={{
					...row,
					textDecoration: 'underline solid #0b7fab 4px',
				}}
			>
				مرحبا بالعالم
			</p>
		</AbsoluteFill>
	);
};

export const textDecoration = {
	component: Component,
	id: 'text-decoration',
	width: 500,
	height: 360,
	fps: 30,
	durationInFrames: 1,
} as const;
