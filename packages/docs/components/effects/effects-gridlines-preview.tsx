import {gridlines} from '@remotion/effects/gridlines';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsGridlinesPreview: React.FC<{
	readonly gridSize: number;
	readonly lineWidth: number;
	readonly lineColor: string;
	readonly backgroundColor: string;
	readonly rotation: number;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly perspective: number;
	readonly offsetX: number;
	readonly offsetY: number;
}> = ({
	gridSize,
	lineWidth,
	lineColor,
	backgroundColor,
	rotation,
	rotationX,
	rotationY,
	perspective,
	offsetX,
	offsetY,
}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			color="#101828"
			effects={[
				gridlines({
					gridSize,
					lineWidth,
					lineColor,
					backgroundColor,
					rotation,
					rotationX,
					rotationY,
					perspective,
					offsetX,
					offsetY,
				}),
			]}
		/>
	);
};
