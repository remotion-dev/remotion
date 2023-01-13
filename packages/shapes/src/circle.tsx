import React from 'react';
import {makeCircle} from './make-circle';

export type CircleProps = React.SVGProps<SVGPathElement> & {
	width: number;
	height: number;
	cx: number;
	cy: number;
	radius?: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	style?: React.CSSProperties;
};

export const Circle: React.FC<CircleProps> = ({
	width,
	height,
	cx,
	cy,
	fill,
	radius,
	stroke,
	strokeWidth,
	style,
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={style}
		>
			<path
				d={makeCircle({
					cx,
					cy,
					radius,
				})}
				fill={fill}
				stroke={stroke}
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};
