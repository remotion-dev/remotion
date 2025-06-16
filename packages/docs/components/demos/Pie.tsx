import {Pie} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const PieDemo: React.FC<{
	readonly radius: number;
	readonly darkMode: boolean;
	readonly progress: number;
	readonly closePath: boolean;
	readonly showStrokeInsteadPlaygroundOnly: boolean;
	readonly counterClockwise: boolean;
	readonly rotation: number;
}> = ({
	radius,
	darkMode,
	progress,
	closePath,
	showStrokeInsteadPlaygroundOnly,
	counterClockwise,
	rotation,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Pie
				progress={progress}
				fill={
					showStrokeInsteadPlaygroundOnly
						? 'transparent'
						: darkMode
							? 'white'
							: 'var(--ifm-link-color)'
				}
				radius={radius}
				closePath={closePath}
				stroke={darkMode ? 'white' : 'var(--ifm-link-color)'}
				strokeWidth={showStrokeInsteadPlaygroundOnly ? 5 : 0}
				counterClockwise={counterClockwise}
				rotation={rotation}
			/>
		</AbsoluteFill>
	);
};
