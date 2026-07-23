import React from 'react';
import {AbsoluteFill} from 'remotion';

// A single glyph with a hard, blur-free horizontal text-shadow offset far
// enough to the right that the (red) shadow is fully separated from the
// (black) glyph. Used to assert that the shadow offset scales with the export
// `scale` option instead of staying at its unscaled pixel size.
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
					textShadow: '60px 0px 0px red',
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
