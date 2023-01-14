import React from 'react';
import {makeSquare} from './make-square';

export type SquareProps = {
	width: number;
	height: number;
	size: number;
	fill?: string;
	style?: React.CSSProperties;
};

export const Square: React.FC<SquareProps> = ({
	width,
	height,
	size,
	fill,
	style,
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={style}
			data-shape-type="square"
		>
			<path
				d={makeSquare({
					size,
				})}
				fill={fill}
			/>
		</svg>
	);
};
