import type React from 'react';
import type {MakeTriangleProps} from '../make-triangle';
import {makeTriangle} from '../make-triangle';
import type {AllShapesProps} from './render-svg';
import {renderSvg} from './render-svg';

export type TriangleProps = MakeTriangleProps & AllShapesProps;

export const Triangle: React.FC<TriangleProps> = ({
	// TODO: Do not use width and height, but use length of a side
	width,
	height,
	fill,
	direction,
	...props
}) => {
	return renderSvg({
		fill,
		height,
		path: makeTriangle({
			width,
			height,
			direction,
		}),
		...props,
		width,
	});
};
