import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill>
			<svg
				viewBox="0 0 100 100"
				width="100"
				height="100"
				style={{transform: 'rotate(45deg)'}}
			>
				<polygon points="50,10 90,90 10,90" fill="orange" />
			</svg>
		</AbsoluteFill>
	);
};

export const simpleRotatedSvg = {
	component: Component,
	id: 'simple-rotated-svg',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
