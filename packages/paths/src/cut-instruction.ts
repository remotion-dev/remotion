import type {
	CInstruction,
	LInstruction,
	Point,
	ReducedInstruction,
} from './helpers/types';

const cutLInstruction = ({
	instruction,
	startingPoint,
	progress,
}: {
	instruction: LInstruction;
	startingPoint: Point;
	progress: number;
}): LInstruction => {
	const x = startingPoint.x + (instruction.x - startingPoint.x) * progress;
	const y = startingPoint.y + (instruction.y - startingPoint.y) * progress;

	return {
		type: 'L',
		x,
		y,
	};
};

function interpolatePoint(pA: Point, pB: Point, factor: number) {
	return {
		x: pA.x + (pB.x - pA.x) * factor,
		y: pA.y + (pB.y - pA.y) * factor,
	};
}

export function cutCInstruction({
	progress,
	startingPoint,
	instruction,
}: {
	progress: number;
	startingPoint: Point;
	instruction: CInstruction;
}): CInstruction {
	// De Casteljau's algorithm for Bezier splitting
	const u = progress;

	// Points of original curve
	const p0 = {x: startingPoint.x, y: startingPoint.y};
	const p1 = {x: instruction.cp1x, y: instruction.cp1y};
	const p2 = {x: instruction.cp2x, y: instruction.cp2y};
	const p3 = {x: instruction.x, y: instruction.y};

	// First level of interpolation
	const p01 = interpolatePoint(p0, p1, u);
	const p12 = interpolatePoint(p1, p2, u);
	const p23 = interpolatePoint(p2, p3, u);

	// Second level of interpolation
	const p012 = interpolatePoint(p01, p12, u);
	const p123 = interpolatePoint(p12, p23, u);

	// Third level of interpolation (this is the mid-point of the curve at u)
	const p0123 = interpolatePoint(p012, p123, u);

	return {
		type: 'C',
		cp1x: p01.x,
		cp1y: p01.y,
		cp2x: p012.x,
		cp2y: p012.y,
		x: p0123.x,
		y: p0123.y,
	};
}

export const cutInstruction = ({
	instruction,
	startingPoint,
	progress,
}: {
	instruction: ReducedInstruction;
	startingPoint: Point;
	progress: number;
}): ReducedInstruction => {
	if (instruction.type === 'M') {
		return instruction;
	}

	if (instruction.type === 'L') {
		return cutLInstruction({instruction, startingPoint, progress});
	}

	if (instruction.type === 'C') {
		return cutCInstruction({instruction, startingPoint, progress});
	}

	throw new TypeError(`${instruction.type} is not supported.`);
};
