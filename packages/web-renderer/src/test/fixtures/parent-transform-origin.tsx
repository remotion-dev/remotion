import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{transform: 'rotate(45deg)', transformOrigin: '0 0'}}>
			<svg viewBox="0 0 100 100" width="100" height="100">
				<rect x="0" y="0" width="50" height="50" fill="orange" />
			</svg>
		</AbsoluteFill>
	);
};

export const parentTransformOrigin = {
	component: Component,
	id: 'parent-transform-origin',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
	calculateMetadata: () => Promise.resolve({}),
} as const;
