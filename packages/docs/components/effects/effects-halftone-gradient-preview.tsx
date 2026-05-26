import type {HalftoneGradientColorMode} from '@remotion/effects/halftone-gradient';
import {halftoneGradient} from '@remotion/effects/halftone-gradient';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const fullSize: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsHalftoneGradientPreview: React.FC<{
	readonly firstStopDotSize: number;
	readonly secondStopDotSize: number;
	readonly gridSize: number;
	readonly rotation: number;
	readonly colorMode: HalftoneGradientColorMode;
	readonly dotColor: string;
}> = ({
	firstStopDotSize,
	secondStopDotSize,
	gridSize,
	rotation,
	colorMode,
	dotColor,
}) => {
	const colorParams =
		colorMode === 'source'
			? ({colorMode: 'source'} as const)
			: ({colorMode: 'solid', dotColor} as const);

	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			style={fullSize}
			effects={[
				halftoneGradient({
					firstStopDotSize,
					secondStopDotSize,
					gridSize,
					rotation,
					...colorParams,
				}),
			]}
		/>
	);
};
