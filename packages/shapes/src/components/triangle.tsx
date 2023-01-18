import React from 'react';
import type {MakeTriangleProps} from '../utils/make-triangle';
import {makeTriangle} from '../utils/make-triangle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type TriangleProps = MakeTriangleProps & AllShapesProps;

export const Triangle: React.FC<TriangleProps> = ({
	length,
	direction,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			{...makeTriangle({length, direction, edgeRoundness})}
			{...props}
		/>
	);
};
