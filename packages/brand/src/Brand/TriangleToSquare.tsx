import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {interpolate} from 'remotion';
import {Rect, Triangle} from '@remotion/shapes';
import React from 'react';
import {getBackground, getBrand, Theme} from './colors';

export const TriangleToSquare: React.FC<{
	progress: number;
	length: number;
	style: React.CSSProperties;
	opacity: number;
	theme: Theme;
}> = ({progress, length, style, opacity, theme}) => {
	const triangleEdgeRoundness = interpolate(
		progress,
		[0, 0.5],
		[0.707, Math.sqrt(2) - 1]
	);
	const rectEdgeRoundness = interpolate(
		progress,
		[0.5, 1],
		[(4 * (Math.sqrt(2) - 1)) / 3, 0.69]
	);

	const color = interpolateColors(
		progress,
		[0, 1],
		[
			interpolateColors(
				opacity,
				[0, 1],
				[getBackground(theme), getBrand(theme)]
			),
			interpolateColors(opacity, [0, 1], [getBackground(theme), '#F43B00']),
		]
	);

	const correctCenter = interpolate(progress, [0.5, 1], [-80, 0]);

	if (progress > 0.5) {
		return (
			<Rect
				height={length * 0.58}
				width={length * 0.58}
				edgeRoundness={rectEdgeRoundness}
				style={{...style, marginLeft: correctCenter}}
				fill={color}
			/>
		);
	}

	return (
		<Triangle
			direction="right"
			fill={color}
			length={length}
			style={style}
			edgeRoundness={triangleEdgeRoundness}
		/>
	);
};

export const TriangleDemo: React.FC<{
	theme: Theme;
}> = ({theme}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [0, 100], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<TriangleToSquare
				progress={progress}
				length={300}
				opacity={1}
				style={{}}
				theme={theme}
			/>
		</AbsoluteFill>
	);
};
