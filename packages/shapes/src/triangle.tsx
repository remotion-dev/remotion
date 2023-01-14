import React from 'react';
import {makeTriangle} from './make-triangle';

export type TriangleProps = {
	width: number;
	height: number;
	fill?: string;
	direction: 'right' | 'left' | 'top' | 'bottom';
	style?: React.CSSProperties;
};

export const Triangle: React.FC<TriangleProps> = ({
	width,
	height,
	fill,
	direction,
	style,
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={style}
			data-shape-type="triangle"
		>
			<path
				d={makeTriangle({
					width,
					height,
					direction,
				})}
				fill={fill}
			/>
		</svg>
	);
};
