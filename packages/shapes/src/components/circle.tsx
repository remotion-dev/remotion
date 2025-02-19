import React from 'react';
import type {MakeCircleProps} from '../utils/make-circle';
import {makeCircle} from '../utils/make-circle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type CircleProps = MakeCircleProps & AllShapesProps;

/**
 * @description Renders an SVG element drawing a circle.
 * @param {Number} radius The radius of the circle.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/circle)
 */
export const Circle: React.FC<CircleProps> = ({radius, ...props}) => {
	return <RenderSvg {...makeCircle({radius})} {...props} />;
};
