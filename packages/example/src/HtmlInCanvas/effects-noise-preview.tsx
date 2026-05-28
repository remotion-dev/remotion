import {noise} from '@remotion/effects/noise';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsNoisePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				noise({
					amount: 0.25,
					seed: 7,
					premultiply: false,
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
