import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsHalftoneLinearGradientPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				halftoneLinearGradient({
					firstStopDotSize: 0,
					secondStopDotSize: 42,
					firstStopPosition: [0, 0.5],
					secondStopPosition: [1, 0.5],
					gridSize: 24,
					dotColor: '#0b84f3',
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
