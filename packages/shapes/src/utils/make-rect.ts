import {serializeInstructions} from './instructions';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeRectOptions = {
	width: number;
	height: number;
	squircleFactor?: number | null;
};

export const makeRect = ({
	width,
	height,
	squircleFactor = null,
}: MakeRectOptions): ShapeInfo => {
	const transformOrigin: [number, number] = [width / 2, height / 2];
	const instructions = joinPoints(
		[
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0],
		],
		{squircleFactor}
	);
	const path = serializeInstructions(instructions);

	return {
		width,
		height,
		instructions,
		path,
		transformOrigin: transformOrigin.join(' '),
	};
};
