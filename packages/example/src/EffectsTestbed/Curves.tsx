import {curves} from '@remotion/effects/curves';
import React from 'react';
import {CanvasImage} from 'remotion';

export const CurvesEffect: React.FC = () => {
	return (
		<CanvasImage
			src="https://remotion.media/transition-bg-blue.jpg"
			width={1280}
			height={720}
			fit="cover"
			effects={[
				curves({
					points: [
						[0, 0],
						[0.25, 0.12],
						[0.75, 0.88],
						[1, 1],
					],
				}),
			]}
		/>
	);
};
