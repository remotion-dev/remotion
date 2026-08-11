import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

type ArrowDirection = 'right' | 'left' | 'up' | 'down';

export type MakeArrowProps = {
	length?: number;
	headWidth?: number;
	headLength?: number;
	shaftWidth?: number;
	direction?: ArrowDirection;
	cornerRadius?: number;
};

const unitDir = (
	from: [number, number],
	to: [number, number],
): [number, number] => {
	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const len = Math.sqrt(dx * dx + dy * dy);
	return len === 0 ? [0, 0] : [dx / len, dy / len];
};

const buildArrowPath = (
	points: [number, number][],
	roundedIndices: Set<number>,
	cornerRadius: number,
): Instruction[] => {
	const n = points.length;

	if (cornerRadius === 0) {
		return [
			{type: 'M', x: points[0][0], y: points[0][1]},
			...points
				.slice(1)
				.map(([x, y]): Instruction => ({type: 'L' as const, x, y})),
			{type: 'Z'},
		];
	}

	// Corner 0 is always rounded — start at its depart point
	const d0 = unitDir(points[0], points[1]);
	const startX = points[0][0] + d0[0] * cornerRadius;
	const startY = points[0][1] + d0[1] * cornerRadius;
	const instrs: Instruction[] = [{type: 'M', x: startX, y: startY}];

	for (let i = 1; i < n; i++) {
		const curr = points[i];
		if (roundedIndices.has(i)) {
			const prev = points[i - 1];
			const next = points[(i + 1) % n];
			const dIn = unitDir(prev, curr);
			const dOut = unitDir(curr, next);

			instrs.push(
				{
					type: 'L',
					x: curr[0] - dIn[0] * cornerRadius,
					y: curr[1] - dIn[1] * cornerRadius,
				},
				{
					type: 'C',
					cp1x: curr[0],
					cp1y: curr[1],
					cp2x: curr[0],
					cp2y: curr[1],
					x: curr[0] + dOut[0] * cornerRadius,
					y: curr[1] + dOut[1] * cornerRadius,
				},
			);
		} else {
			instrs.push({type: 'L', x: curr[0], y: curr[1]});
		}
	}

	// Close back to corner 0 (rounded)
	const dIn0 = unitDir(points[n - 1], points[0]);
	instrs.push(
		{
			type: 'L',
			x: points[0][0] - dIn0[0] * cornerRadius,
			y: points[0][1] - dIn0[1] * cornerRadius,
		},
		{
			type: 'C',
			cp1x: points[0][0],
			cp1y: points[0][1],
			cp2x: points[0][0],
			cp2y: points[0][1],
			x: startX,
			y: startY,
		},
		{type: 'Z'},
	);

	return instrs;
};

/**
 * @description Generates an SVG path for an arrow shape.
 * @param {Number} length The total length of the arrow along its direction axis. Default 300.
 * @param {Number} headWidth The width of the arrowhead at its widest point. Default 185.
 * @param {Number} headLength The length of the arrowhead portion. Default 120.
 * @param {Number} shaftWidth The width of the arrow shaft. Default 80.
 * @param {string} direction The direction the arrow points. Default 'right'.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-arrow)
 */
export const makeArrow = ({
	length = 300,
	headWidth = 185,
	headLength = 120,
	shaftWidth = 80,
	direction = 'right',
	cornerRadius = 0,
}: MakeArrowProps): ShapeInfo => {
	if (length <= 0 || headWidth <= 0 || headLength <= 0 || shaftWidth <= 0) {
		throw new Error(
			'All dimension parameters ("length", "headWidth", "headLength", "shaftWidth") must be positive numbers',
		);
	}

	if (headWidth < shaftWidth) {
		throw new Error(
			`"headWidth" must be greater than or equal to "shaftWidth", got headWidth=${headWidth} and shaftWidth=${shaftWidth}`,
		);
	}

	if (headLength > length) {
		throw new Error(
			`"headLength" must be less than or equal to "length", got headLength=${headLength} and length=${length}`,
		);
	}

	const shaftTop = (headWidth - shaftWidth) / 2;
	const shaftBottom = shaftTop + shaftWidth;
	const shaftEnd = length - headLength;

	// Points for a right-pointing arrow (clockwise from top-left of shaft)
	const rightPoints: [number, number][] = [
		[0, shaftTop],
		[shaftEnd, shaftTop],
		[shaftEnd, 0],
		[length, headWidth / 2],
		[shaftEnd, headWidth],
		[shaftEnd, shaftBottom],
		[0, shaftBottom],
	];

	let points: [number, number][];
	let width: number;
	let height: number;

	if (direction === 'right') {
		points = rightPoints;
		width = length;
		height = headWidth;
	} else if (direction === 'left') {
		// Mirror x: x -> length - x
		points = rightPoints.map(([x, y]): [number, number] => [length - x, y]);
		width = length;
		height = headWidth;
	} else if (direction === 'down') {
		// Rotate 90° clockwise: swap axes so the tip points down
		points = [
			[shaftTop, 0],
			[shaftBottom, 0],
			[shaftBottom, shaftEnd],
			[headWidth, shaftEnd],
			[headWidth / 2, length],
			[0, shaftEnd],
			[shaftTop, shaftEnd],
		];
		width = headWidth;
		height = length;
	} else {
		// up: mirror of down (y -> length - y)
		points = [
			[shaftTop, length],
			[shaftBottom, length],
			[shaftBottom, headLength],
			[headWidth, headLength],
			[headWidth / 2, 0],
			[0, headLength],
			[shaftTop, headLength],
		];
		width = headWidth;
		height = length;
	}

	// Round the back corners and all 3 arrowhead tips, but not the inner
	// shaft-to-head junctions so the shaft edges stay straight.
	// right/left: back = 0,6; head tips = 2,3,4; inner junctions (skip) = 1,5
	// up/down:    back = 0,1; head tips = 3,4,5; inner junctions (skip) = 2,6
	const roundedIndices =
		direction === 'right' || direction === 'left'
			? new Set([0, 2, 3, 4, 6])
			: new Set([0, 1, 3, 4, 5]);

	const instructions = buildArrowPath(points, roundedIndices, cornerRadius);

	const path = serializeInstructions(instructions);

	return {
		path,
		instructions,
		width,
		height,
		transformOrigin: `${width / 2} ${height / 2}`,
	};
};
