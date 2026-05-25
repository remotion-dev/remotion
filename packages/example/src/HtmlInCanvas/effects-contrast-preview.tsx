import {contrast} from '@remotion/effects/contrast';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsContrastPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[contrast({amount: 1.5})]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
