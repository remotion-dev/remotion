import {mirror} from '@remotion/effects/mirror';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsMirrorPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[mirror({direction: 'horizontal', position: 0.5})]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
