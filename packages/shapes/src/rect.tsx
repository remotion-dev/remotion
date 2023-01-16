import type React from 'react';
import {makeRect} from './make-rect';
import {renderSvg} from './render-svg';

export type SquareProps = {
	width: number;
	height: number;
	fill?: string;
	style?: React.CSSProperties;
};

export const Rect: React.FC<SquareProps> = ({width, height, fill, style}) => {
	return renderSvg({
		fill,
		height,
		path: makeRect({
			width,
			height,
		}),
		width,
		style,
	});
};
