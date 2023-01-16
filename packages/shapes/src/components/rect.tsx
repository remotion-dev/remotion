import type React from 'react';
import {makeRect} from '../make-rect';
import type {AllShapesProps} from './render-svg';
import {renderSvg} from './render-svg';

export type SquareProps = {
	width: number;
	height: number;
} & AllShapesProps;

export const Rect: React.FC<SquareProps> = ({
	width,
	height,
	fill,
	...props
}) => {
	return renderSvg({
		fill,
		height,
		path: makeRect({
			width,
			height,
		}),
		width,
		...props,
	});
};
