import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
			}}
		>
			<p>
				<strong>Hello</strong> world
			</p>
		</AbsoluteFill>
	);
};

export const simpleRotatedSvg = {
	component: Component,
	id: 'paragraph-with-strong',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
