import {glow} from '@remotion/effects/glow';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsGlowPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				glow({
					radius: 24,
					intensity: 1.5,
					threshold: 0.35,
					color: '#00d8ff',
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
