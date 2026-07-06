import {paper} from '@remotion/effects/paper';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const PAPER_PREVIEW_PARAMS = {
	amount: 1,
	colorFront: '#fff8df',
	colorBack: '#b9a375',
	contrast: 0.72,
	roughness: 0.52,
	fiber: 0.58,
	fiberSize: 0.48,
	crumples: 0.42,
	crumpleSize: 0.36,
	folds: 0.32,
	foldCount: 9,
	drops: 0.16,
	fade: 0.15,
	seed: 21,
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
				}),
			]}
		/>
	);
};
