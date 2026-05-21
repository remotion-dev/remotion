import {blur} from '@remotion/effects/blur';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsBlurPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas width={width} height={height} effects={[blur({radius: 25})]}>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
