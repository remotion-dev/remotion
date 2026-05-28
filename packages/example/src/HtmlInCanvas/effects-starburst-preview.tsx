import {starburst} from '@remotion/starburst';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsStarburstPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				starburst({
					rays: 16,
					colors: ['#ffdd00', '#ff8800', '#ff4400'],
					rotation: 15,
					smoothness: 0.1,
					origin: [0.5, 0.5],
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
