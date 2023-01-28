import React from 'react';
import type {MakePieProps} from '../utils/make-pie';
import {makePie} from '../utils/make-pie';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type PieProps = MakePieProps & AllShapesProps;

export const Pie: React.FC<PieProps> = ({
	radius,
	progress,
	closePath,
	counterClockwise,
	...props
}) => {
	return (
		<RenderSvg
			{...makePie({radius, progress, closePath, counterClockwise})}
			{...props}
		/>
	);
};
