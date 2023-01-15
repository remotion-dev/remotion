import React from 'react';
import {makeEllipse} from './make-ellipse';

export type EllipseProps = React.SVGProps<SVGPathElement> & {
	rx: number;
	ry: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	style?: React.CSSProperties;
};

export const Ellipse: React.FC<EllipseProps> = ({
	fill,
	stroke,
	strokeWidth,
	rx,
	ry,
	style,
}) => {
	return (
		<svg
			width={rx * 2}
			height={ry * 2}
			viewBox={`0 0 ${rx * 2} ${ry * 2}`}
			xmlns="http://www.w3.org/2000/svg"
			style={style}
			data-shape-type="ellipse"
		>
			<path
				d={makeEllipse({
					rx,
					ry,
				})}
				fill={fill}
				stroke={stroke}
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};
