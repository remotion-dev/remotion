import React from 'react';
import {interpolateColors, useCurrentFrame} from 'remotion';

export const ColorInterpolation: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: interpolateColors(
					frame,
					[0, 50, 100],
					['red', 'yellow', 'blue'],
				),
			}}
		/>
	);
};
