import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{display: 'none'}}>
			<svg viewBox="0 0 100 100" width="100" height="100">
				<rect x="0" y="0" width="100" height="100" fill="orange" />
			</svg>
		</AbsoluteFill>
	);
};

export const displayNone = {
	component: Component,
	id: 'display-none',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
