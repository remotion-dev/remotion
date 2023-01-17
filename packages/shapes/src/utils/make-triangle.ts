// Copied from https://stackblitz.com/edit/react-triangle-svg?file=index.js

import {serializeInstructions} from './instructions';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

type Direction = 'right' | 'left' | 'top' | 'bottom';

export type MakeTriangleProps = {
	length: number;
	direction: Direction;
};

export const makeTriangle = ({
	length,
	direction = 'right',
}: MakeTriangleProps): ShapeInfo => {
	const longerDimension = length;
	const shorterSize = Math.sqrt(length ** 2 * 0.75); // Calculated on paper;

	const points: {[key in Direction]: [number, number][]} = {
		top: [
			[longerDimension / 2, 0],
			[0, shorterSize],
			[longerDimension, shorterSize],
			[longerDimension / 2, 0],
		],
		right: [
			[0, 0],
			[0, longerDimension],
			[shorterSize, longerDimension / 2],
			[0, 0],
		],
		bottom: [
			[0, 0],
			[longerDimension, 0],
			[longerDimension / 2, shorterSize],
			[0, 0],
		],
		left: [
			[shorterSize, 0],
			[shorterSize, longerDimension],
			[0, longerDimension / 2],
			[shorterSize, 0],
		],
	};

	const transformOriginX = {
		left: (shorterSize / 3) * 2,
		right: shorterSize / 3,
		top: longerDimension / 2,
		bottom: longerDimension / 2,
	}[direction];

	const transformOriginY = {
		top: (shorterSize / 3) * 2,
		bottom: shorterSize / 3,
		left: longerDimension / 2,
		right: longerDimension / 2,
	}[direction];

	const instructions = joinPoints(points[direction], {squircleFactor: 0.7});
	const path = serializeInstructions(instructions);

	return {
		path,
		instructions,
		width: direction === 'top' || direction === 'bottom' ? length : shorterSize,
		height:
			direction === 'top' || direction === 'bottom' ? shorterSize : length,
		transformOrigin: `${transformOriginX} ${transformOriginY}`,
	};
};
