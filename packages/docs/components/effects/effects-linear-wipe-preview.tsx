import {linearWipe} from '@remotion/effects/linear-wipe';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsLinearWipePreview: React.FC<{
	readonly completion: number;
	readonly angle: number;
	readonly feather: number;
}> = ({completion, angle, feather}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[linearWipe({completion, angle, feather})]}
		/>
	);
};
