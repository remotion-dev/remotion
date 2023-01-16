import type React from 'react';
import type {MakeCircleProps} from '../make-circle';
import {makeCircle} from '../make-circle';
import type {AllShapesProps} from './render-svg';
import {renderSvg} from './render-svg';

export type CircleProps = MakeCircleProps & AllShapesProps;

export const Circle: React.FC<CircleProps> = ({fill, radius, ...props}) => {
	const size = radius * 2;

	return renderSvg({
		path: makeCircle({
			radius,
		}),
		height: size,
		width: size,
		fill,
		...props,
	});
};
