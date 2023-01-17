import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeRectOptions = {
	width: number;
	height: number;
};

export const makeRect = ({width, height}: MakeRectOptions): ShapeInfo => {
	const transformOrigin: [number, number] = [width / 2, height / 2];
	const path = joinPoints(
		[
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0],
		],
		{squircleFactor: 1}
	);

	return {
		width,
		height,
		path,
		transformOrigin: transformOrigin.join(' '),
	};
};
