import {Spark} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const SparkDemo: React.FC<{
	readonly darkMode: boolean;
	readonly width: number;
	readonly height: number;
	readonly edgeRoundness: number;
	readonly cornerRadius: number;
}> = ({darkMode, width, height, edgeRoundness, cornerRadius}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Spark
				width={width}
				height={height}
				edgeRoundness={edgeRoundness}
				cornerRadius={cornerRadius}
				fill={darkMode ? 'white' : 'var(--ifm-link-color)'}
			/>
		</AbsoluteFill>
	);
};
