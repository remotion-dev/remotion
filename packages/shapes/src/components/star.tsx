import React from 'react';
import {Interactive} from 'remotion';
import type {MakeStarProps} from '../utils/make-star';
import {makeStar} from '../utils/make-star';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type StarProps = MakeStarProps & Omit<AllShapesProps, 'points'>;

const starSchema = makeShapeSchema({
	points: numberField({
		defaultValue: 5,
		description: 'Points',
		min: 3,
		step: 1,
	}),
	innerRadius: numberField({
		defaultValue: 50,
		description: 'Inner Radius',
		min: 0,
	}),
	outerRadius: numberField({
		defaultValue: 100,
		description: 'Outer Radius',
		min: 0,
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a star.
 * @param {Number} innerRadius The inner radius of the star.
 * @param {Number} outerRadius The outer radius of the star.
 * @param {Number} points The amount of points of the star.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/star)
 */

const StarInner: React.FC<StarProps> = ({
	innerRadius,
	outerRadius,
	points,
	cornerRadius,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Star>"
			documentationLink="https://www.remotion.dev/docs/shapes/star"
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

export const Star = Interactive.withSchema({
	Component: StarInner,
	componentName: '<Star>',
	componentIdentity: 'dev.remotion.shapes.Star',
	schema: starSchema,
	supportsEffects: true,
}) as React.FC<StarProps>;
