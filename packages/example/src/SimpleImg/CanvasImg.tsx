import {halftone} from '@remotion/effects/halftone';
import React from 'react';
import {CanvasImage, staticFile} from 'remotion';

export const CanvasImg = (): React.ReactNode => {
	return (
		<CanvasImage
			effects={[
				halftone({
					dotSize: 28,
				}),
			]}
			src={staticFile('1.jpg')}
		/>
	);
};
