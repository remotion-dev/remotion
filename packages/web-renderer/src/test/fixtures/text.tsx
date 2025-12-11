import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
			}}
		>
			<p>Hello world! This is really long, so I think it should wrap?</p>
		</AbsoluteFill>
	);
};

export const textFixture = {
	component: Component,
	id: 'text',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
