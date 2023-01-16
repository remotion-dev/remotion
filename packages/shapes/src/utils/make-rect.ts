import type {ShapeInfo} from './shape-info';

export type MakeRectOptions = {
	width: number;
	height: number;
};

export const makeRect = ({width, height}: MakeRectOptions): ShapeInfo => {
	return {
		width,
		height,
		path: `M 0 0 l ${width} 0 l 0 ${height} l ${-width} 0 Z`,
	};
};
