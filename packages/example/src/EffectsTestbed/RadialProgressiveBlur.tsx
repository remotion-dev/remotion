import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile, useVideoConfig} from 'remotion';

const page: React.CSSProperties = {
	backgroundColor: '#10141d',
};

export const RadialProgressiveBlurTest: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill style={page}>
			<CanvasImage
				src={staticFile('1.jpg')}
				width={width}
				height={height}
				fit="cover"
				effects={[
					radialProgressiveBlur({
						center: [0.568, 0.383],
						width: 1.62,
						height: 1.892,
						rotation: 1968.6,
						start: 0.39,
						startBlur: 0,
						endBlur: 178,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
