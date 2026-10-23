import {colorCorrection} from '@remotion/effects/color-correction';
import {curves} from '@remotion/effects/curves';
import {levels} from '@remotion/effects/levels';
import React from 'react';
import {CanvasImage} from 'remotion';

export const ColorCorrectionStudioDemo: React.FC = () => {
	return (
		<CanvasImage
			name="Color correction demo"
			src="https://remotion.media/transition-bg-blue.jpg"
			width={1280}
			height={720}
			fit="cover"
			effects={[
				colorCorrection({
					exposure: 0.4,
					contrast: 1.2,
				}),
			]}
		/>
	);
};

export const LevelsStudioDemo: React.FC = () => {
	return (
		<CanvasImage
			name="Levels demo"
			src="https://remotion.media/transition-bg-blue.jpg"
			width={1280}
			height={720}
			fit="cover"
			effects={[
				levels({
					gamma: 2.01,
				}),
			]}
		/>
	);
};

export const CurvesStudioDemo: React.FC = () => {
	return (
		<CanvasImage
			name="Curves demo"
			src="https://remotion.media/transition-bg-blue.jpg"
			width={1280}
			height={720}
			fit="cover"
			effects={[
				curves({
					points: [
						[0, 0],
						[0.214, 0.552],
						[1, 1],
					],
				}),
			]}
		/>
	);
};
