import {Callout} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const CalloutDemo: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly pointerLength: number;
	readonly pointerBaseWidth: number;
	readonly pointerPosition: number;
	readonly pointerDirection: 'up' | 'down' | 'left' | 'right';
	readonly edgeRoundness: number;
	readonly darkMode: boolean;
	readonly debug: boolean;
	readonly cornerRadius: number;
}> = ({
	width,
	height,
	pointerLength,
	pointerBaseWidth,
	pointerPosition,
	pointerDirection,
	debug,
	edgeRoundness,
	cornerRadius,
	darkMode,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Callout
				fill={darkMode ? 'white' : 'var(--ifm-link-color)'}
				edgeRoundness={edgeRoundness}
				width={width}
				height={height}
				pointerLength={pointerLength}
				pointerBaseWidth={pointerBaseWidth}
				pointerPosition={pointerPosition}
				pointerDirection={pointerDirection}
				debug={debug}
				cornerRadius={cornerRadius}
			/>
		</AbsoluteFill>
	);
};
