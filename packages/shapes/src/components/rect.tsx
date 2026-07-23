import React from 'react';
import {Interactive} from 'remotion';
import type {MakeRectOptions} from '../utils/make-rect';
import {makeRect} from '../utils/make-rect';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type RectProps = MakeRectOptions & AllShapesProps;

const rectSchema = makeShapeSchema({
	width: numberField({
		defaultValue: 100,
		description: 'Width',
		min: 0,
	}),
	height: numberField({
		defaultValue: 100,
		description: 'Height',
		min: 0,
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a rectangle.
 * @param {Number} width The width of the Rectangle
 * @param {Number} height The height of the Rectangle
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/rect)
 */
const RectInner: React.FC<RectProps> = ({
	width,
	edgeRoundness,
	height,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Rect>"
			documentationLink="https://www.remotion.dev/docs/shapes/rect"
			{...makeRect({height, width, edgeRoundness, cornerRadius})}
			{...props}
		/>
	);
};

export const Rect = Interactive.withSchema({
	Component: RectInner,
	componentName: '<Rect>',
	componentIdentity: 'dev.remotion.shapes.Rect',
	schema: rectSchema,
	supportsEffects: true,
}) as React.FC<RectProps>;
