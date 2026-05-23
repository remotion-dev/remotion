import {invert} from '@remotion/effects/invert';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsInvertPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas width={width} height={height} effects={[invert()]}>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
