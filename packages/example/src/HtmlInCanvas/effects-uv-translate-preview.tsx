import {uvTranslate} from '@remotion/effects/translate';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsUvTranslatePreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				uvTranslate({
					u: 0.15,
					v: 0.125,
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
