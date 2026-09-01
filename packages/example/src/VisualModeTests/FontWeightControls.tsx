import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';

const rowStyle: React.CSSProperties = {
	alignItems: 'center',
	borderRadius: 24,
	display: 'flex',
	flex: 1,
	fontFamily: 'sans-serif',
	fontSize: 48,
	justifyContent: 'center',
};

export const FontWeightControls: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0f172a',
				color: '#f8fafc',
				gap: 16,
				padding: 60,
			}}
		>
			<Interactive.Div
				name="Hundreds font weight"
				style={{
					...rowStyle,
					backgroundColor: '#0369a1',
					fontWeight: 700,
				}}
			>
				Hundreds: 700
			</Interactive.Div>
			<Interactive.Div
				name="Numeric font weight"
				style={{
					...rowStyle,
					backgroundColor: '#1d4ed8',
					fontWeight: 650,
				}}
			>
				Numeric: 650
			</Interactive.Div>
			<Interactive.Div
				name="String font weight"
				style={{
					...rowStyle,
					backgroundColor: '#6d28d9',
					fontWeight: '650',
				}}
			>
				String: &apos;650&apos;
			</Interactive.Div>
			<Interactive.Div
				name="Keyword font weight"
				style={{
					...rowStyle,
					backgroundColor: '#be123c',
					fontWeight: 'bold',
				}}
			>
				Keyword: &apos;bold&apos;
			</Interactive.Div>
		</AbsoluteFill>
	);
};
