import {whiteNoise} from '@remotion/effects/white-noise';
import React from 'react';
import {Solid, useCurrentFrame} from 'remotion';

// Rendered at half resolution and upscaled so the grain reads as film, not pixels.
export const Grain: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Solid
			width={960}
			height={540}
			color="#808080"
			effects={[whiteNoise({amount: 1, seed: frame})]}
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: 1920,
				height: 1080,
				opacity: 0.06,
				pointerEvents: 'none',
			}}
		/>
	);
};
