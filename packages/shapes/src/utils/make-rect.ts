import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeRectOptions = {
	width: number;
	height: number;
};

export const makeRect = ({width, height}: MakeRectOptions): ShapeInfo => {
	const path = joinPoints([
		[0, 0],
		[width, 0],
		[width, height],
		[0, height],
	]);

	return {
		width,
		height,
		path,
		transformOrigin: `${width / 2} ${height / 2}`,
	};
};
