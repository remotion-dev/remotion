import {zigzag} from '@remotion/effects/zigzag';
import React from 'react';
import {Solid, useCurrentFrame, useVideoConfig} from 'remotion';

export const MovingZigzags: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<Solid
			color="#dff4ff"
			width={width}
			height={height}
			effects={[
				zigzag({
					colors: ['#dff4ff', '#7cc6ff'],
					direction: 'horizontal',
					thickness: 40,
					gap: 0,
					angle: 0,
					offset: (frame / durationInFrames) * 480,
					amplitude: 40,
					wavelength: 160,
				}),
			]}
		/>
	);
};
