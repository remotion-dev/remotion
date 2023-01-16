import type React from 'react';
import type {MakeEllipseOptions} from '../make-ellipse';
import {makeEllipse} from '../make-ellipse';
import type {AllShapesProps} from './render-svg';
import {renderSvg} from './render-svg';

export type EllipseProps = MakeEllipseOptions & AllShapesProps;

export const Ellipse: React.FC<EllipseProps> = ({rx, ry, ...props}) => {
	const path = makeEllipse({
		rx,
		ry,
	});

	return renderSvg({
		height: ry * 2,
		path,
		width: rx * 2,
		...props,
	});
};
