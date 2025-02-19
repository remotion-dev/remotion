import React from 'react';
import type {MakePieProps} from '../utils/make-pie';
import {makePie} from '../utils/make-pie';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type PieProps = MakePieProps & AllShapesProps;

/**
 * @description Renders an SVG element drawing a pie piece.
 * @param {Number} radius The radius of the circle..
 * @param {Number} progress The percentage of the circle that is filled. 0 means fully empty, 1 means fully filled.
 * @param {Boolean} closePath If set to false, no path to the middle of the circle will be drawn, leading to an open arc. Default true.
 * @param {Boolean} counterClockwise If set, the circle gets filled counterclockwise instead of clockwise. Default false.
 * @param {Boolean} rotation Add rotation to the path. 0 means no rotation, Math.PI * 2 means 1 full clockwise rotation
 * @see [Documentation](https://www.remotion.dev/docs/shapes/pie)
 */

export const Pie: React.FC<PieProps> = ({
	radius,
	progress,
	closePath,
	counterClockwise,
	rotation,
	...props
}) => {
	return (
		<RenderSvg
			{...makePie({radius, progress, closePath, counterClockwise, rotation})}
			{...props}
		/>
	);
};
