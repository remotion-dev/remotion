import type React from 'react';
import type {MakeEllipseOptions} from '../make-ellipse';
import {makeEllipse} from '../make-ellipse';
import {renderSvg} from './render-svg';

export type EllipseProps = MakeEllipseOptions & {
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
	const path = makeEllipse({
		rx,
		ry,
	});

	return renderSvg({
		height: ry * 2,
		path,
		width: rx * 2,
		fill,
		style,
		strokeWidth,
		stroke,
	});
};
