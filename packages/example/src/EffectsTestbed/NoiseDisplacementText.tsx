import {noiseDisplacement} from '@remotion/effects/noise-displacement';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile, useVideoConfig} from 'remotion';

const container: React.CSSProperties = {
	backgroundColor: 'black',
};

const canvasStyle: React.CSSProperties = {
	scale: 1.83,
};

export const NoiseDisplacementText: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill style={container}>
			<CanvasImage
				src={staticFile('effects-noise-displacement-text.png')}
				width={width}
				height={height}
				fit="cover"
				style={canvasStyle}
				effects={[
					noiseDisplacement({
						center: [0.6124309308853857, 0.5010527449123625],
						radius: 0.41,
						strength: 15.5,
						seed: 78,
						grainSize: 0.9,
						passes: 12,
						feather: 1,
						biasDirection: 313,
						biasAmount: 1,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
