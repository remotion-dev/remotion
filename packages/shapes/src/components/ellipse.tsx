import React from 'react';
import type {MakeEllipseOptions} from '../make-ellipse';
import {makeEllipse} from '../make-ellipse';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type EllipseProps = MakeEllipseOptions & AllShapesProps;

export const Ellipse: React.FC<EllipseProps> = ({rx, ry, ...props}) => {
	const path = makeEllipse({
		rx,
		ry,
	});
	return <RenderSvg width={rx * 2} height={ry * 2} path={path} {...props} />;
};
