import type {LinearProgressiveBlurUvCoordinate} from '@remotion/effects/linear-progressive-blur';
import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsLinearProgressiveBlurPreview: React.FC<{
	readonly start: LinearProgressiveBlurUvCoordinate;
	readonly end: LinearProgressiveBlurUvCoordinate;
	readonly startBlur: number;
	readonly endBlur: number;
}> = ({start, end, startBlur, endBlur}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				linearProgressiveBlur({
					start,
					end,
					startBlur,
					endBlur,
				}),
			]}
		/>
	);
};
