import {uvTranslate, xyTranslate} from '@remotion/effects/translate';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsXyTranslatePreview: React.FC<{
	readonly x: number;
	readonly y: number;
}> = ({x, y}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[xyTranslate({x, y})]}
		/>
	);
};

export const EffectsUvTranslatePreview: React.FC<{
	readonly u: number;
	readonly v: number;
}> = ({u, v}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[uvTranslate({u, v})]}
		/>
	);
};
