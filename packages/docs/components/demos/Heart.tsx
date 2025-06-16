import {Heart} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const HeartDemo: React.FC<{
	readonly darkMode: boolean;
	readonly width: number;
	readonly height: number;
}> = ({width, height, darkMode}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Heart
				fill={darkMode ? 'white' : 'var(--ifm-link-color)'}
				width={width}
				height={height}
				debug
			/>
		</AbsoluteFill>
	);
};
