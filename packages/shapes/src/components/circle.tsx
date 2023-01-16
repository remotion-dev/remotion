import React from 'react';
import type {MakeCircleProps} from '../utils/make-circle';
import {makeCircle} from '../utils/make-circle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type CircleProps = MakeCircleProps & AllShapesProps;

export const Circle: React.FC<CircleProps> = ({radius, ...props}) => {
	const {path, height, width} = makeCircle({radius});

	return <RenderSvg width={width} height={height} path={path} {...props} />;
};
