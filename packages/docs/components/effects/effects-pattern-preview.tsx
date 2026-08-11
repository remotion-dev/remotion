import {pattern, type PatternOrigin} from '@remotion/effects/pattern';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsPatternPreview: React.FC<{
	readonly scale: number;
	readonly cropLeft: number;
	readonly cropTop: number;
	readonly cropRight: number;
	readonly cropBottom: number;
	readonly gapX: number;
	readonly gapY: number;
	readonly offsetU: number;
	readonly offsetV: number;
	readonly rowOffset: number;
	readonly rowOffsetEvery: number;
	readonly columnOffset: number;
	readonly columnOffsetEvery: number;
	readonly origin: PatternOrigin;
	readonly wrap: boolean;
}> = ({
	scale,
	cropLeft,
	cropTop,
	cropRight,
	cropBottom,
	gapX,
	gapY,
	offsetU,
	offsetV,
	rowOffset,
	rowOffsetEvery,
	columnOffset,
	columnOffsetEvery,
	origin,
	wrap,
}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				pattern({
					scale,
					cropLeft,
					cropTop,
					cropRight,
					cropBottom,
					gapX,
					gapY,
					offsetU,
					offsetV,
					rowOffset,
					rowOffsetEvery,
					columnOffset,
					columnOffsetEvery,
					origin,
					wrap,
				}),
			]}
		/>
	);
};
