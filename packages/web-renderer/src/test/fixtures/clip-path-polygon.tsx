import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: 150,
					height: 150,
					backgroundColor: 'blue',
					clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const clipPathPolygon = {
	component: Component,
	id: 'clip-path-polygon',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
