import {duotone} from '@remotion/effects/duotone';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsDuotonePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				duotone({
					darkColor: 'black',
					lightColor: 'white',
					threshold: 0.18,
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
