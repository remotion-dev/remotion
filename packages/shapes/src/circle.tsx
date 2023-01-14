import React from 'react';
import {makeCircle} from './make-circle';

export type CircleProps = React.SVGProps<SVGPathElement> & {
	width: number;
	height: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	style?: React.CSSProperties;
};

export const Circle: React.FC<CircleProps> = ({
	width,
	height,
	fill,
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
			data-shape-type="circle"
		>
			<path
				d={makeCircle({
					cx: 50,
					cy: 50,
					radius: 50,
				})}
				fill={fill}
				stroke={stroke}
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};
