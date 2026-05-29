import type {
	HalftoneLinearGradientColorMode,
	UvCoordinate,
} from '@remotion/effects/halftone-linear-gradient';
import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

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
	const {width, height} = useVideoConfig();
	const colorParams =
		colorMode === 'source'
			? ({colorMode: 'source'} as const)
			: ({colorMode: 'solid', dotColor} as const);

	return (
		<Solid
			width={width}
			height={height}
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
