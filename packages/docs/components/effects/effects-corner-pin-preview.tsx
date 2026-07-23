import type {CornerPinUvCoordinate} from '@remotion/effects/corner-pin';
import {cornerPin} from '@remotion/effects/corner-pin';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsCornerPinPreview: React.FC<{
	readonly topLeft: CornerPinUvCoordinate;
	readonly topRight: CornerPinUvCoordinate;
	readonly bottomRight: CornerPinUvCoordinate;
	readonly bottomLeft: CornerPinUvCoordinate;
}> = ({topLeft, topRight, bottomRight, bottomLeft}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				cornerPin({
					topLeft,
					topRight,
					bottomRight,
					bottomLeft,
				}),
			]}
		/>
	);
};
