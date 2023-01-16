import React from 'react';
import type {MakeRectOptions} from '../utils/make-rect';
import {makeRect} from '../utils/make-rect';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type RectProps = MakeRectOptions & AllShapesProps;

export const Rect: React.FC<RectProps> = ({width, height, ...props}) => {
	const {path} = makeRect({width, height});

	return <RenderSvg height={height} width={width} path={path} {...props} />;
};
