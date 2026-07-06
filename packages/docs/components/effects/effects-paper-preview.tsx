import {paper} from '@remotion/effects/paper';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const PAPER_PREVIEW_PARAMS = {
	amount: 1,
	colorFront: '#9fadbc',
	colorBack: '#ffffff',
	contrast: 0.3,
	roughness: 0.4,
	fiber: 0.3,
	fiberSize: 0.2,
	crumples: 0.3,
	crumpleSize: 0.35,
	folds: 0.65,
	foldCount: 5,
	drops: 0.2,
	fade: 0,
	seed: 6,
	scale: 0.6,
} as const;

export const EffectsPaperPreview: React.FC<{
	readonly amount: number;
	readonly colorFront: string;
	readonly colorBack: string;
	readonly contrast: number;
	readonly roughness: number;
	readonly fiber: number;
	readonly fiberSize: number;
	readonly crumples: number;
	readonly crumpleSize: number;
	readonly folds: number;
	readonly foldCount: number;
	readonly drops: number;
	readonly fade: number;
	readonly seed: number;
	readonly scale: number;
}> = ({
	amount,
	colorFront,
	colorBack,
	contrast,
	roughness,
	fiber,
	fiberSize,
	crumples,
	crumpleSize,
	folds,
	foldCount,
	drops,
	fade,
	seed,
	scale,
}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				paper({
					amount,
					colorFront,
					colorBack,
					contrast,
					roughness,
					fiber,
					fiberSize,
					crumples,
					crumpleSize,
					folds,
					foldCount,
					drops,
					fade,
					seed,
					scale,
				}),
			]}
		/>
	);
};
