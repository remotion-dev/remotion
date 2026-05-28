import {inverseDotGrid} from '@remotion/effects/inverse-dot-grid';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const fullSize: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsInverseDotGridPreview: React.FC<{
	readonly dotSize: number;
	readonly gridSize: number;
	readonly invert: boolean;
}> = ({dotSize, gridSize, invert}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			style={fullSize}
			effects={[
				inverseDotGrid({
					dotSize,
					gridSize,
					invert,
				}),
			]}
		/>
	);
};
