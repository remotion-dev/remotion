// Copied from https://stackblitz.com/edit/react-triangle-svg?file=index.js

import {serializeInstructions} from './instructions';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

type Direction = 'right' | 'left' | 'up' | 'down';

export type MakeTriangleProps = {
	length: number;
	direction: Direction;
	edgeRoundness?: number | null;
	cornerRadius?: number;
};

export const makeTriangle = ({
	length,
	direction = 'right',
	edgeRoundness = null,
	cornerRadius = 0,
}: MakeTriangleProps): ShapeInfo => {
	const longerDimension = length;
	const shorterSize = Math.sqrt(length ** 2 * 0.75); // Calculated on paper;

	const points: {[key in Direction]: [number, number][]} = {
		up: [
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
		down: [
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
		up: longerDimension / 2,
		down: longerDimension / 2,
	}[direction];

	const transformOriginY = {
		up: (shorterSize / 3) * 2,
		down: shorterSize / 3,
		left: longerDimension / 2,
		right: longerDimension / 2,
	}[direction];

	const instructions = joinPoints(points[direction], {
		edgeRoundness,
		cornerRadius,
		roundCornerStrategy: 'bezier',
	});
	const path = serializeInstructions(instructions);

	return {
		path,
		instructions,
		width: direction === 'up' || direction === 'down' ? length : shorterSize,
		height: direction === 'up' || direction === 'down' ? shorterSize : length,
		transformOrigin: `${transformOriginX} ${transformOriginY}`,
	};
};
