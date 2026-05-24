import {tint} from '@remotion/effects/tint';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsTintPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[tint({color: '#ff0080', amount: 0.5})]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
