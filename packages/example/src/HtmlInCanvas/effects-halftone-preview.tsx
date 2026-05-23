import {halftone} from '@remotion/effects/halftone';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsHalftonePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				halftone({
					shape: 'circle',
					dotSize: 8,
					dotSpacing: 7,
					rotation: 12,
					color: '#111827',
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
