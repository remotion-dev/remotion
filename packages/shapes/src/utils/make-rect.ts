import type {ShapeInfo} from './shape-info';

export type MakeRectOptions = {
	width: number;
	height: number;
};

export const makeRect = ({width, height}: MakeRectOptions): ShapeInfo => {
	const x = 0;
	const y = 0;

	return {
		width,
		height,
		path: `M ${x} ${y} l ${width} 0 l 0 ${height} l ${-width} 0 Z`,
	};
};
