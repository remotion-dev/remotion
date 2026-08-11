import type {
	CInstruction,
	LInstruction,
	Point,
	ReducedInstruction,
} from './helpers/types';

const cutLInstruction = ({
	instruction,
	lastPoint,
	progress,
}: {
	instruction: LInstruction;
	lastPoint: Point;
	progress: number;
}): LInstruction => {
	const x = lastPoint.x + (instruction.x - lastPoint.x) * progress;
	const y = lastPoint.y + (instruction.y - lastPoint.y) * progress;

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
	lastPoint,
	instruction,
}: {
	progress: number;
	lastPoint: Point;
	instruction: CInstruction;
}): CInstruction {
	// De Casteljau's algorithm for Bezier splitting
	const u = progress;

	// Points of original curve
	const p0 = {x: lastPoint.x, y: lastPoint.y};
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
	lastPoint,
	progress,
}: {
	instruction: ReducedInstruction;
	lastPoint: Point;
	progress: number;
}): ReducedInstruction => {
	if (instruction.type === 'M') {
		return instruction;
	}

	if (instruction.type === 'L') {
		return cutLInstruction({instruction, lastPoint, progress});
	}

	if (instruction.type === 'C') {
		return cutCInstruction({instruction, lastPoint, progress});
	}

	// TODO: Could we cut it as well?
	if (instruction.type === 'Z') {
		return instruction;
	}

	// @ts-expect-error
	throw new TypeError(`${instruction.type} is not supported.`);
};
