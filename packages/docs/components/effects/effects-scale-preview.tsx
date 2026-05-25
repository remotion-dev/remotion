import {scale} from '@remotion/effects/scale';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsScalePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas width={width} height={height} effects={[scale({scale: 0.8})]}>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
