import React from 'react';
import type {MakeTriangleProps} from '../utils/make-triangle';
import {makeTriangle} from '../utils/make-triangle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type TriangleProps = MakeTriangleProps & AllShapesProps;

/**
 * @description Renders an SVG element containing a triangle with same length on all sides.
 * @param {Number} length The length of one triangle side.
 * @param {string} direction The direction of the triangle
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/triangle)
 */
export const Triangle: React.FC<TriangleProps> = ({
	length,
	direction,
	edgeRoundness,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			{...makeTriangle({length, direction, edgeRoundness, cornerRadius})}
			{...props}
		/>
	);
};
