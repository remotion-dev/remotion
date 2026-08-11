import type {MirrorDirection} from '@remotion/effects/mirror';
import {mirror} from '@remotion/effects/mirror';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsMirrorPreview: React.FC<{
	readonly direction: MirrorDirection;
	readonly position: number;
	readonly invert: boolean;
}> = ({direction, position, invert}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[mirror({direction, position, invert})]}
		/>
	);
};
