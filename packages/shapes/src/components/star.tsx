import React from 'react';
import type {MakeStarProps} from '../utils/make-star';
import {makeStar} from '../utils/make-star';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type StarProps = MakeStarProps & Omit<AllShapesProps, 'points'>;

/**
 * @description Renders an SVG element containing a star.
 * @param {Number} innerRadius The inner radius of the star.
 * @param {Number} outerRadius The outer radius of the star.
 * @param {Number} points The amount of points of the star.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/star)
 */

export const Star: React.FC<StarProps> = ({
	innerRadius,
	outerRadius,
	points,
	cornerRadius,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			{...makeStar({
				innerRadius,
				outerRadius,
				points,
				cornerRadius,
				edgeRoundness,
			})}
			{...props}
		/>
	);
};
