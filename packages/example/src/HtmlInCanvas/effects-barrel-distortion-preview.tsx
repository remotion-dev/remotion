import {barrelDistortion} from '@remotion/effects/barrel-distortion';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsBarrelDistortionPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				barrelDistortion({
					amount: 0.25,
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
