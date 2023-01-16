import React from 'react';
import type {MakeEllipseOptions} from '../utils/make-ellipse';
import {makeEllipse} from '../utils/make-ellipse';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type EllipseProps = MakeEllipseOptions & AllShapesProps;

export const Ellipse: React.FC<EllipseProps> = ({rx, ry, ...props}) => {
	return <RenderSvg {...makeEllipse({rx, ry})} {...props} />;
};
