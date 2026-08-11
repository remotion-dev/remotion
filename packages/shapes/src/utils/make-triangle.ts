// Copied from https://stackblitz.com/edit/react-triangle-svg?file=index.js

import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

type Direction = 'right' | 'left' | 'up' | 'down';

export type MakeTriangleProps = {
	length: number;
	direction: Direction;
	edgeRoundness?: number | null;
	cornerRadius?: number;
};

/**
 * @description Generates an SVG path for a triangle with the same length on all sides.
 * @param {Number} length The length of one triangle side.
 * @param {string} direction The direction of the triangle
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-triangle)
 */
export const makeTriangle = ({
	length,
	direction = 'right',
	edgeRoundness = null,
	cornerRadius = 0,
}: MakeTriangleProps): ShapeInfo => {
	if (typeof length !== 'number') {
		throw new Error(
			`"length" of a triangle must be a number, got ${JSON.stringify(length)}`,
		);
	}

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

	const instructions: Instruction[] = [
		...joinPoints(points[direction], {
			edgeRoundness,
			cornerRadius,
			roundCornerStrategy: 'bezier',
		}),
		{
			type: 'Z',
		},
	];
	const path = serializeInstructions(instructions);

	return {
		path,
		instructions,
		width: direction === 'up' || direction === 'down' ? length : shorterSize,
		height: direction === 'up' || direction === 'down' ? shorterSize : length,
		transformOrigin: `${transformOriginX} ${transformOriginY}`,
	};
};
