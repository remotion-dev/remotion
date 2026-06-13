import {pageTurn, type PageTurnDirection} from '@remotion/effects/page-turn';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsPageTurnPreview: React.FC<{
	readonly progress: number;
	readonly direction: PageTurnDirection;
	readonly foldRadius: number;
	readonly shadow: number;
	readonly backOpacity: number;
}> = ({progress, direction, foldRadius, shadow, backOpacity}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				pageTurn({
					progress,
					direction,
					foldRadius,
					shadow,
					backOpacity,
				}),
			]}
		/>
	);
};
