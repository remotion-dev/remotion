import React from 'react';
import type {MakeTriangleProps} from '../utils/make-triangle';
import {makeTriangle} from '../utils/make-triangle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type TriangleProps = MakeTriangleProps & AllShapesProps;

export const Triangle: React.FC<TriangleProps> = ({
	// TODO: Do not use width and height, but use length of a side
	length,
	direction,
	...props
}) => {
	return (
		<RenderSvg
			height={100}
			width={100}
			path={makeTriangle({
				length,
				direction,
			})}
			{...props}
		/>
	);
};
