import {contourLines} from '@remotion/effects/contour-lines';
import React from 'react';
import {AbsoluteFill, CanvasImage, Solid} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsContourLinesPreview: React.FC<{
	readonly lineColor: string;
	readonly lineWidth: number;
	readonly spacing: number;
	readonly scale: number;
	readonly complexity: number;
	readonly smoothness: number;
	readonly seed: number;
	readonly offsetX: number;
	readonly offsetY: number;
	readonly opacity: number;
	readonly maskToSourceAlpha: boolean;
}> = ({
	lineColor,
	lineWidth,
	spacing,
	scale,
	complexity,
	smoothness,
	seed,
	offsetX,
	offsetY,
	opacity,
	maskToSourceAlpha,
}) => {
	return (
		<AbsoluteFill>
			<CanvasImage
				src={EFFECTS_PREVIEW_IMAGE_SRC}
				width={1280}
				height={720}
				fit="cover"
				style={{position: 'absolute', zIndex: 0}}
			/>
			<Solid
				color="transparent"
				width={1280}
				height={720}
				style={{position: 'absolute', zIndex: 1}}
				effects={[
					contourLines({
						lineColor,
						lineWidth,
						spacing,
						scale,
						complexity,
						smoothness,
						seed,
						offsetX,
						offsetY,
						opacity,
						maskToSourceAlpha,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
