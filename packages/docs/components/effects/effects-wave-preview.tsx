import {wave} from '@remotion/effects/wave';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsWavePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				wave({
					phase: 1.2,
					amplitude: 50,
					wavelength: 200,
					direction: 'horizontal',
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
