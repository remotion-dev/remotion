import {
	regionBlur,
	type RegionBlurUvCoordinate,
} from '@remotion/effects/region-blur';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsRegionBlurPreview: React.FC<{
	readonly topLeft: RegionBlurUvCoordinate;
	readonly bottomRight: RegionBlurUvCoordinate;
	readonly blurRadius: number;
	readonly feather: number;
	readonly roundness: number;
}> = ({topLeft, bottomRight, blurRadius, feather, roundness}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				regionBlur({
					topLeft,
					bottomRight,
					blurRadius,
					feather,
					roundness,
				}),
			]}
		/>
	);
};
