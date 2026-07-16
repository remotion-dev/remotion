import React from 'react';
import {Interactive} from 'remotion';
import type {MakeTriangleProps} from '../utils/make-triangle';
import {makeTriangle} from '../utils/make-triangle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {enumField, makeShapeSchema, numberField} from './schema';

export type TriangleProps = MakeTriangleProps & AllShapesProps;

const triangleSchema = makeShapeSchema({
	length: numberField({
		defaultValue: 100,
		description: 'Length',
		min: 0,
	}),
	direction: enumField({
		defaultValue: 'right',
		description: 'Direction',
		variants: ['right', 'left', 'up', 'down'],
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a triangle with same length on all sides.
 * @param {Number} length The length of one triangle side.
 * @param {string} direction The direction of the triangle
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/triangle)
 */
const TriangleInner: React.FC<TriangleProps> = ({
	length,
	direction,
	edgeRoundness,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Triangle>"
			documentationLink="https://www.remotion.dev/docs/shapes/triangle"
			{...makeTriangle({length, direction, edgeRoundness, cornerRadius})}
			{...props}
		/>
	);
};

export const Triangle = Interactive.withSchema({
	Component: TriangleInner,
	componentName: '<Triangle>',
	componentIdentity: 'dev.remotion.shapes.Triangle',
	schema: triangleSchema,
	supportsEffects: true,
}) as React.FC<TriangleProps>;
