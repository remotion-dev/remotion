import React from 'react';
import type {MakeRectOptions} from '../utils/make-rect';
import {makeRect} from '../utils/make-rect';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type RectProps = MakeRectOptions & AllShapesProps;

/**
 * @description Renders an SVG element containing a rectangle.
 * @param {Number} width The width of the Rectangle
 * @param {Number} height The height of the Rectangle
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/rect)
 */
export const Rect: React.FC<RectProps> = ({
	width,
	edgeRoundness,
	height,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			{...makeRect({height, width, edgeRoundness, cornerRadius})}
			{...props}
		/>
	);
};
