import type React from 'react';
import type {MakeCircleProps} from './make-circle';
import {makeCircle} from './make-circle';
import {renderSvg} from './render-svg';

export type CircleProps = Omit<MakeCircleProps, 'cx' | 'cy'> & {
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	style?: React.CSSProperties;
};

export const Circle: React.FC<CircleProps> = ({
	fill,
	stroke,
	strokeWidth,
	style,
	radius,
}) => {
	const size = radius * 2;

	return renderSvg({
		path: makeCircle({
			cx: radius,
			cy: radius,
			radius,
		}),
		height: size,
		width: size,
		fill,
		stroke,
		strokeWidth,
		style,
	});
};
