import React from 'react';
import {makeRect} from './make-rect';

export type SquareProps = {
	width: number;
	height: number;
	fill?: string;
	style?: React.CSSProperties;
};

export const Rect: React.FC<SquareProps> = ({width, height, fill, style}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={style}
			data-shape-type="rect"
		>
			<path
				d={makeRect({
					width,
					height,
				})}
				fill={fill}
			/>
		</svg>
	);
};
