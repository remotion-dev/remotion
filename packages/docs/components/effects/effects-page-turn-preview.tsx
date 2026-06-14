import {pageTurn} from '@remotion/effects/page-turn';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsPageTurnPreview: React.FC<{
	readonly progress: number;
	readonly angle: number;
	readonly foldRadius: number;
	readonly shadow: number;
	readonly backOpacity: number;
}> = ({progress, angle, foldRadius, shadow, backOpacity}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				pageTurn({
					progress,
					angle,
					foldRadius,
					shadow,
					backOpacity,
				}),
			]}
		/>
	);
};
