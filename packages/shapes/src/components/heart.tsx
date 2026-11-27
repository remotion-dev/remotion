import React from 'react';
import {Interactive} from 'remotion';
import type {MakeHeartProps} from '../utils/make-heart';
import {makeHeart} from '../utils/make-heart';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type HeartProps = MakeHeartProps & AllShapesProps;

const heartSchema = makeShapeSchema({
	height: numberField({
		defaultValue: 100,
		description: 'Height',
		min: 0,
	}),
	aspectRatio: numberField({
		defaultValue: 1.1,
		description: 'Aspect Ratio',
		min: 0,
		step: 0.01,
	}),
	bottomRoundnessAdjustment: numberField({
		defaultValue: 0,
		description: 'Bottom Roundness Adjustment',
		step: 0.01,
	}),
	depthAdjustment: numberField({
		defaultValue: 0,
		description: 'Depth Adjustment',
		step: 0.01,
	}),
});

/**
 * @description Renders an SVG element containing a heart.
 * @param {Number} size The size of the heart.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/heart)
 */
const HeartInner = React.forwardRef<SVGPathElement, HeartProps>(
	(
		{
			aspectRatio,
			height,
			bottomRoundnessAdjustment = 0,
			depthAdjustment = 0,
			...props
		},
		pathRef,
	) => {
		return (
			<RenderSvg
				pathRef={pathRef}
				defaultName="<Heart>"
				documentationLink="https://www.remotion.dev/docs/shapes/heart"
				{...makeHeart({
					aspectRatio,
					height,
					bottomRoundnessAdjustment,
					depthAdjustment,
				})}
				{...props}
			/>
		);
	},
);
HeartInner.displayName = 'HeartInner';

export const Heart = Interactive.withSchema({
	Component: HeartInner,
	componentName: '<Heart>',
	componentIdentity: 'dev.remotion.shapes.Heart',
	schema: heartSchema,
	supportsEffects: true,
}) as React.FC<HeartProps>;
