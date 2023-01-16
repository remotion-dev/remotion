import React from 'react';
import type {MakeCircleProps} from '../make-circle';
import {makeCircle} from '../make-circle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type CircleProps = MakeCircleProps & AllShapesProps;

export const Circle: React.FC<CircleProps> = ({radius, ...props}) => {
	return (
		<RenderSvg
			width={radius * 2}
			height={radius * 2}
			path={makeCircle({
				radius,
			})}
			{...props}
		/>
	);
};
