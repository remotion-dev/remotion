import {Spark} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const SparkDemo: React.FC<{
	readonly darkMode: boolean;
	readonly width: number;
	readonly height: number;
	readonly innerRadius: number;
	readonly points: number;
	readonly rotation: number;
	readonly tipRoundness: number;
	readonly valleyRoundness: number;
	readonly edgeRoundness: number | null;
}> = ({
	width,
	height,
	innerRadius,
	points,
	rotation,
	darkMode,
	tipRoundness,
	valleyRoundness,
	edgeRoundness,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Spark
				fill={darkMode ? 'white' : 'var(--ifm-link-color)'}
				width={width}
				height={height}
				innerRadius={innerRadius}
				points={points}
				rotation={rotation}
				tipRoundness={tipRoundness}
				valleyRoundness={valleyRoundness}
				edgeRoundness={edgeRoundness}
			/>
		</AbsoluteFill>
	);
};
