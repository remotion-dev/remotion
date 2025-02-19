import React from 'react';
import type {MakeEllipseOptions} from '../utils/make-ellipse';
import {makeEllipse} from '../utils/make-ellipse';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type EllipseProps = MakeEllipseOptions & AllShapesProps;

/**
 * @description Renders an SVG element drawing an ellipse.
 * @param {Number} rx The radius of the ellipse on the X axis.
 * @param {Number} ry The radius of the ellipse on the Y axis.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/ellipse)
 */

export const Ellipse: React.FC<EllipseProps> = ({rx, ry, ...props}) => {
	return <RenderSvg {...makeEllipse({rx, ry})} {...props} />;
};
