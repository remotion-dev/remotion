import {saturation} from '@remotion/effects/saturation';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsSaturationPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[saturation({amount: 1.8})]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
