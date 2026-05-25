import {brightness} from '@remotion/effects/brightness';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsBrightnessPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[brightness({amount: 0.25})]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
