import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					left: 20,
					top: 20,
					fontSize: 40,
					fontWeight: 'bold',
					color: 'black',
					opacity: 0.45,
					textShadow:
						'60px 0px 0px red, 65px 0px 0px red, 70px 0px 0px red, 75px 0px 0px red',
				}}
			>
				1
			</div>
		</AbsoluteFill>
	);
};

export const textShadowScale = {
	component: Component,
	id: 'text-shadow-scale',
	width: 300,
	height: 100,
	fps: 25,
	durationInFrames: 1,
} as const;
