import type {ShapeInfo} from './shape-info';

export type MakeEllipseOptions = {
	rx: number;
	ry: number;
};

export const makeEllipse = ({rx, ry}: MakeEllipseOptions): ShapeInfo => {
	return {
		width: rx * 2,
		height: ry * 2,
		path: `M ${rx} ${0} a ${rx} ${ry} 0 1 0 1 0`,
		transformOrigin: `${rx} ${ry}`,
	};
};
