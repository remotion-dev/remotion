import type {FisheyeUvCoordinate} from '@remotion/effects/fisheye';
import {fisheye} from '@remotion/effects/fisheye';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsFisheyePreview: React.FC<{
	readonly fieldOfView: number;
	readonly radius: number;
	readonly zoom: number;
	readonly center: FisheyeUvCoordinate;
}> = ({fieldOfView, radius, zoom, center}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				fisheye({
					fieldOfView,
					radius,
					zoom,
					center,
				}),
			]}
		/>
	);
};
