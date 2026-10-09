import {waves} from '@remotion/effects/waves';
import React from 'react';
import {Interactive, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

const MovingWavesInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<Solid
			color="#dff4ff"
			width={width}
			height={height}
			effects={[
				waves({
					colors: ['#dff4ff', '#7cc6ff'],
					direction: 'horizontal',
					thickness: 56,
					gap: 0,
					angle: 0,
					offset: (frame / durationInFrames) * 448,
					amplitude: 24,
					wavelength: 160,
					phase: 0,
				}),
			]}
		/>
	);
};

export const MovingWaves = Interactive.withSchema({
	Component: MovingWavesInner,
	componentName: 'MovingWaves',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
