import React from 'react';
import type {MakeArrowProps} from '../utils/make-arrow';
import {makeArrow} from '../utils/make-arrow';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type ArrowProps = MakeArrowProps & AllShapesProps;

/**
 * @description Renders an SVG element containing an arrow shape.
 * @param {Number} length The total length of the arrow along its direction axis. Default 300.
 * @param {Number} headWidth The width of the arrowhead at its widest point. Default 185.
 * @param {Number} headLength The length of the arrowhead portion. Default 120.
 * @param {Number} shaftWidth The width of the arrow shaft. Default 80.
 * @param {string} direction The direction the arrow points. Default 'right'.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/arrow)
 */
export const Arrow: React.FC<ArrowProps> = ({
	length,
	headWidth,
	headLength,
	shaftWidth,
	direction,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			{...makeArrow({
				length,
				headWidth,
				headLength,
				shaftWidth,
				direction,
				cornerRadius,
			})}
			{...props}
		/>
	);
};
