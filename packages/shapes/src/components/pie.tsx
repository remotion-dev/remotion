import React from 'react';
import type {MakePieProps} from '../utils/make-pie';
import {makePie} from '../utils/make-pie';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type PieProps = MakePieProps & AllShapesProps;

export const Pie: React.FC<PieProps> = ({
	radius,
	fillAmount,
	closePath,
	...props
}) => {
	return <RenderSvg {...makePie({radius, fillAmount, closePath})} {...props} />;
};
