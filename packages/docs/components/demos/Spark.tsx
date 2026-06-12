import {Spark} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const SparkDemo: React.FC<{
	readonly darkMode: boolean;
	readonly innerRadius: number;
	readonly outerRadius: number;
	readonly cornerRadius: number;
	readonly edgeRoundness: number | null;
}> = ({innerRadius, outerRadius, darkMode, cornerRadius, edgeRoundness}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Spark
				fill={darkMode ? 'white' : 'var(--ifm-link-color)'}
				innerRadius={innerRadius}
				outerRadius={outerRadius}
				cornerRadius={cornerRadius}
				edgeRoundness={edgeRoundness}
			/>
		</AbsoluteFill>
	);
};
