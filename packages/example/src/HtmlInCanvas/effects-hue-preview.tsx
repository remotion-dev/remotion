import {hue} from '@remotion/effects/hue';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsHuePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas width={width} height={height} effects={[hue({degrees: 120})]}>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
