import type {
	HalftoneLinearGradientColorMode,
	UvCoordinate,
} from '@remotion/effects/halftone-linear-gradient';
import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const fullSize: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsHalftoneLinearGradientPreview: React.FC<{
	readonly firstStopDotSize: number;
	readonly secondStopDotSize: number;
	readonly firstStopPosition: UvCoordinate;
	readonly secondStopPosition: UvCoordinate;
	readonly gridSize: number;
	readonly colorMode: HalftoneLinearGradientColorMode;
	readonly dotColor: string;
}> = ({
	firstStopDotSize,
	secondStopDotSize,
	firstStopPosition,
	secondStopPosition,
	gridSize,
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
				halftoneLinearGradient({
					firstStopDotSize,
					secondStopDotSize,
					firstStopPosition,
					secondStopPosition,
					gridSize,
					...colorParams,
				}),
			]}
		/>
	);
};
