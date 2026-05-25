import {grayscale} from '@remotion/effects/grayscale';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsGrayscalePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas width={width} height={height} effects={[grayscale()]}>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
