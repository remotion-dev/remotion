import {getBoundingBox} from './get-bounding-box';
import {getLength} from './get-length';
import {getPointAtLength} from './get-point-at-length';
import {getTangentAtLength} from './get-tangent-at-length';
import type {Instruction} from './helpers/types';
import {parsePath} from './parse-path';
import {reduceInstructions} from './reduce-instructions';
import {serializeInstructions} from './serialize-instructions';

type P = {x: number; y: number};

function calculateIntersection(p1: P, p2: P, p3: P, p4: P) {
	const c2x = p3.x - p4.x; // (x3 - x4)
	const c3x = p1.x - p2.x; // (x1 - x2)
	const c2y = p3.y - p4.y; // (y3 - y4)
	const c3y = p1.y - p2.y; // (y1 - y2)

	// down part of intersection point formula
	const d = c3x * c2y - c3y * c2x;

	if (d === 0) {
		throw new Error('Number of intersection points is zero or infinity.');
	}

	// upper part of intersection point formula
	const u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
	const u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

	// intersection point formula

	const px = (u1 * c2x - c3x * u4) / d;
	const py = (u1 * c2y - c3y * u4) / d;

	const p = {x: px, y: py};

	return p;
}

const interpolateC = (
	instruction: Instruction,
	startX: number,
	startY: number,
	progress: number
): Instruction => {
	if (instruction.type !== 'C') {
		throw new Error('expected C');
	}

	// https://en.wikipedia.org/wiki/B%C3%A9zier_curve#/media/File:B%C3%A9zier_3_big.gif

	const green1 = {
		x: (instruction.cp1x - startX) * progress + startX,
		y: (instruction.cp1y - startY) * progress + startY,
	};
	const green2And3 = {
		x: (instruction.cp2x - instruction.cp1x) * progress + instruction.cp1x,
		y: (instruction.cp2y - instruction.cp1y) * progress + instruction.cp1y,
	};
	const green4 = {
		x: (instruction.x - instruction.cp2x) * progress + instruction.cp2x,
		y: (instruction.y - instruction.cp2y) * progress + instruction.cp2y,
	};

	const fakePath = serializeInstructions([
		{
			type: 'M',
			x: startX,
			y: startY,
		},
		instruction,
	]);

	const length = getLength(fakePath);
	const bluePoint = getPointAtLength(fakePath, progress * length);
	const {x: x2, y: y2} = getTangentAtLength(fakePath, progress * length);
	const bluePoint2 = {x: bluePoint.x + x2, y: bluePoint.y + y2};

	const intersection = calculateIntersection(
		green1,
		green2And3,
		bluePoint,
		bluePoint2
	);

	return {
		type: 'C',
		cp1x: green1.x,
		cp1y: green1.y,
		cp2x: intersection.x,
		cp2y: intersection.y,
		x: bluePoint.x,
		y: bluePoint.y,
	};
};

export const slicePath = (d: string, from: number, to: number): string => {
	// TODO: getSubpaths()
	const parse = parsePath(d);
	const reduced = reduceInstructions(parse).slice(0, 2);
	const box = getBoundingBox(d);

	const fromAbsolute = box.height * from;
	const toAbsolute = box.height * to;

	const currentPosition = {x: 0, y: 0};
	if (reduced[0].type !== 'M') {
		throw new Error('expected M');
	}

	let firstInstructionSet = false;

	const mapped = reduced
		.map((instruction): Instruction[] => {
			const toReturn: Instruction[] = [];
			if (instruction.type === 'Z') {
				return [];
			}

			const start = {x: currentPosition.x, y: currentPosition.y};
			const end = {x: instruction.x, y: instruction.y};

			if (!firstInstructionSet) {
				toReturn.push({
					type: 'M',
					x: currentPosition.x,
					y: currentPosition.y,
				});
			}

			firstInstructionSet = true;

			currentPosition.x = instruction.x;
			currentPosition.y = instruction.y;

			if (instruction.type === 'C') {
				toReturn.push(interpolateC(instruction, start.x, start.y, from));
			} else {
				toReturn.push(instruction);
			}

			return toReturn;
		})
		.flat(1);

	return serializeInstructions(mapped);
};
