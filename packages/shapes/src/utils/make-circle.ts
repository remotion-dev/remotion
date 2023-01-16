import {makeEllipse} from './make-ellipse';
import type {ShapeInfo} from './shape-info';

export type MakeCircleProps = {
	radius: number;
};

export const makeCircle = ({radius}: MakeCircleProps): ShapeInfo => {
	return makeEllipse({rx: radius, ry: radius});
};
