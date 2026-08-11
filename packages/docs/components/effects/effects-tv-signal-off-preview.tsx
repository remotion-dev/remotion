import {tvSignalOff} from '@remotion/effects/tv-signal-off';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsTvSignalOffPreview: React.FC<{
	readonly amount: number;
}> = ({amount}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[tvSignalOff({amount})]}
		/>
	);
};
