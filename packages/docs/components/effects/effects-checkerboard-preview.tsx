import {checkerboard} from '@remotion/effects/checkerboard';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsCheckerboardPreview: React.FC<{
	readonly colors: readonly string[];
	readonly cellSize: number;
	readonly gap: number;
	readonly angle: number;
	readonly offsetX: number;
	readonly offsetY: number;
}> = ({colors, cellSize, gap, angle, offsetX, offsetY}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[checkerboard({colors, cellSize, gap, angle, offsetX, offsetY})]}
		/>
	);
};
