import {shine} from '@remotion/effects/shine';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsShinePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				shine({
					progress: 0.5,
					angle: 30,
					haloSigma: 200,
					coreSigma: 65,
					haloIntensity: 0.3,
					coreIntensity: 0.4,
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
