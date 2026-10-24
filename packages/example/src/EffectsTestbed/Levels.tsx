import {levels} from '@remotion/effects/levels';
import React from 'react';
import {CanvasImage} from 'remotion';

export const LevelsEffect: React.FC = () => {
	return (
		<CanvasImage
			src="https://remotion.media/transition-bg-blue.jpg"
			width={1280}
			height={720}
			fit="cover"
			effects={[
				levels({
					blackPoint: 0.05,
					whitePoint: 0.95,
					gamma: 1.1,
					outputBlack: 0.02,
					outputWhite: 0.98,
				}),
			]}
		/>
	);
};
