import type {IrisWipeCenter} from '@remotion/effects/iris-wipe';
import {irisWipe} from '@remotion/effects/iris-wipe';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsIrisWipePreview: React.FC<{
	readonly center: IrisWipeCenter;
	readonly points: number;
	readonly outerRadius: number;
	readonly useInnerRadius: boolean;
	readonly innerRadius: number;
	readonly rotation: number;
	readonly feather: number;
}> = ({
	center,
	points,
	outerRadius,
	useInnerRadius,
	innerRadius,
	rotation,
	feather,
}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				irisWipe({
					center,
					points,
					outerRadius,
					useInnerRadius,
					innerRadius,
					rotation,
					feather,
				}),
			]}
		/>
	);
};
