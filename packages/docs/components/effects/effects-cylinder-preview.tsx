import {cylinder, type CylinderRender} from '@remotion/effects/cylinder';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsCylinderPreview: React.FC<{
	readonly radius: number;
	readonly rotation: number;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly rotationZ: number;
	readonly position: readonly [number, number];
	readonly render: CylinderRender;
	readonly shading: number;
}> = (params) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[cylinder(params)]}
		/>
	);
};
