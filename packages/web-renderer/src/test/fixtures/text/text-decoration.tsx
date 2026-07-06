import React from 'react';
import {AbsoluteFill} from 'remotion';

const row: React.CSSProperties = {
	fontFamily: 'Arial, sans-serif',
	fontSize: 38,
	fontWeight: 700,
	lineHeight: 1.45,
	margin: 0,
};

const styleRow: React.CSSProperties = {
	...row,
	fontSize: 30,
	lineHeight: 1.35,
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

const StylesComponent: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				color: '#1d2330',
				justifyContent: 'center',
				padding: 24,
			}}
		>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'underline',
					textDecorationStyle: 'dotted',
					textDecorationColor: '#1976d2',
					textDecorationThickness: 4,
				}}
			>
				Dotted underline
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'underline',
					textDecorationStyle: 'dashed',
					textDecorationColor: '#c56b12',
					textDecorationThickness: 4,
				}}
			>
				Dashed underline
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'underline',
					textDecorationStyle: 'double',
					textDecorationColor: '#2b9a66',
					textDecorationThickness: 3,
				}}
			>
				Double underline
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'overline',
					textDecorationStyle: 'dashed',
					textDecorationColor: '#d13131',
					textDecorationThickness: 6,
				}}
			>
				Thick dashed overline
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'line-through',
					textDecorationStyle: 'dotted',
					textDecorationColor: '#623aa2',
					textDecorationThickness: 4,
				}}
			>
				Dotted line-through
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'line-through',
					textDecorationStyle: 'double',
					textDecorationColor: '#0b7fab',
					textDecorationThickness: 4,
				}}
			>
				Double line-through
			</p>
			<p
				style={{
					...styleRow,
					color: '#7b2f91',
					textDecorationLine: 'underline',
					textDecorationStyle: 'dashed',
					textDecorationThickness: 4,
				}}
			>
				Current color dash
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'underline',
					textDecorationStyle: 'wavy',
					textDecorationColor: '#d13131',
					textDecorationThickness: 4,
				}}
			>
				Wavy underline
			</p>
		</AbsoluteFill>
	);
};

const WavyComponent: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				color: '#1d2330',
				justifyContent: 'center',
				padding: 24,
			}}
		>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'underline',
					textDecorationStyle: 'wavy',
					textDecorationColor: '#d13131',
					textDecorationThickness: 4,
				}}
			>
				Wavy across words
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'overline',
					textDecorationStyle: 'wavy',
					textDecorationColor: '#1976d2',
					textDecorationThickness: 4,
				}}
			>
				Wavy overline
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'line-through',
					textDecorationStyle: 'wavy',
					textDecorationColor: '#2b9a66',
					textDecorationThickness: 3,
				}}
			>
				Wavy line-through
			</p>
			<p
				style={{
					...styleRow,
					textDecoration: 'underline wavy #623aa2 6px',
				}}
			>
				Wavy shorthand thick
			</p>
			<p
				style={{
					...styleRow,
					textDecorationLine: 'underline',
					textDecorationStyle: 'wavy',
				}}
			>
				Default thickness wave
			</p>
			<p
				style={{
					...styleRow,
					color: '#7b2f91',
					textDecorationLine: 'underline',
					textDecorationStyle: 'wavy',
					textDecorationThickness: 4,
				}}
			>
				Current color wave
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

export const textDecorationStyles = {
	component: StylesComponent,
	id: 'text-decoration-styles',
	width: 500,
	height: 420,
	fps: 30,
	durationInFrames: 1,
} as const;

export const textDecorationWavy = {
	component: WavyComponent,
	id: 'text-decoration-wavy',
	width: 500,
	height: 420,
	fps: 30,
	durationInFrames: 1,
} as const;
