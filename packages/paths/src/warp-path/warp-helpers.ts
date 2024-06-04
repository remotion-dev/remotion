import {convertQToCInstruction} from '../helpers/convert-q-to-c-instruction';
import type {ReducedInstruction} from '../helpers/types';

export type WarpPathFn = (point: {x: number; y: number}) => {
	x: number;
	y: number;
};

const euclideanDistance = (points: [number, number][]) => {
	const startPoint = points[0];
	const endPoint = points[points.length - 1];
	let d2 = 0;

	for (let i = 0; i < startPoint.length; i++) {
		const d = endPoint[i] - startPoint[i];
		d2 += d ** 2;
	}

	return Math.sqrt(d2);
};

function split(p: number[][], t = 0.5) {
	const seg0 = [];
	const seg1 = [];
	const orders = [p];

	while (orders.length < p.length) {
		const q = orders[orders.length - 1];
		const r = [];

		for (let i = 1; i < q.length; i++) {
			const q0 = q[i - 1];
			const q1 = q[i];
			const s = [];
			const dim = Math.max(q0.length, q1.length);

			for (let j = 0; j < dim; j++) {
				const s0 = q0[j] || 0;
				const s1 = q1[j] || 0;

				s.push(s0 + (s1 - s0) * t);
			}

			r.push(s);
		}

		orders.push(r);
	}

	for (let i = 0; i < orders.length; i++) {
		seg0.push(orders[i][0]);
		seg1.push(orders[orders.length - 1 - i][i]);
	}

	return [seg0, seg1];
}

function interpolateUntil(
	points: [number, number][],
	threshold: number,
	deltaFunction = euclideanDistance,
) {
	const stack = [points];
	const segments = [];

	while (stack.length > 0) {
		const currentPoints = stack.pop() as [number, number][];

		if (deltaFunction(currentPoints) > threshold) {
			const newPoints = split(currentPoints);

			// Add new segments backwards so they end up in correct order
			for (let i = newPoints.length - 1; i >= 0; i--) {
				stack.push(newPoints[i] as [number, number][]);
			}
		} else {
			segments.push(currentPoints);
		}
	}

	return segments;
}

function createLineSegment(points: number[][]): ReducedInstruction {
	switch (points.length) {
		case 2:
			return {
				type: 'L',
				x: points[1][0],
				y: points[1][1],
			};

		case 3:
			return convertQToCInstruction(
				{
					type: 'Q',
					cpx: points[1][0],
					cpy: points[1][1],
					x: points[2][0],
					y: points[2][1],
				},
				{
					x: points[0][0],
					y: points[0][1],
				},
			);

		case 4:
			return {
				type: 'C',
				cp1x: points[1][0],
				cp1y: points[1][1],
				cp2x: points[2][0],
				cp2y: points[2][1],
				x: points[3][0],
				y: points[3][1],
			};
		default:
			throw new Error(
				'Expected 2, 3 or 4 points for a line segment, got ' + points.length,
			);
	}
}

function warpInterpolate(
	path: ReducedInstruction[],
	threshold: number,
	deltaFunction: DeltaFunction,
): ReducedInstruction[] {
	let prexX = 0;
	let prexY = 0;

	return path
		.map((segment) => {
			const points: [number, number][] = [[prexX, prexY]];

			if (segment.type !== 'Z') {
				prexX = segment.x;
				prexY = segment.y;
			}

			if (segment.type === 'C') {
				points.push([segment.cp1x, segment.cp1y]);
				points.push([segment.cp2x, segment.cp2y]);
				points.push([segment.x, segment.y]);
			}

			if (segment.type === 'L') {
				points.push([segment.x, segment.y]);
			}

			if (segment.type === 'C' || segment.type === 'L') {
				return interpolateUntil(points, threshold, deltaFunction).map(
					(rawSegment) => createLineSegment(rawSegment),
				);
			}

			return [segment];
		})
		.flat(1);
}

export function svgPathInterpolate(
	path: ReducedInstruction[],
	threshold: number,
): ReducedInstruction[] {
	let didWork = false;

	const deltaFunction: DeltaFunction = (points) => {
		const linearPoints = [
			points[0].slice(0, 2),
			points[points.length - 1].slice(0, 2),
		] as [number, number][];

		const delta = euclideanDistance(linearPoints);
		didWork = didWork || delta > threshold;

		return delta;
	};

	return warpInterpolate(path, threshold, deltaFunction);
}

type DeltaFunction = (points: [number, number][]) => number;

export const warpTransform = (
	path: ReducedInstruction[],
	transformer: WarpPathFn,
): ReducedInstruction[] => {
	return path
		.map((segment): ReducedInstruction[] => {
			if (segment.type === 'L') {
				const {x, y} = transformer({x: segment.x, y: segment.y});
				return [
					{
						type: 'L',
						x,
						y,
					},
				];
			}

			if (segment.type === 'C') {
				const {x, y} = transformer({x: segment.x, y: segment.y});
				const {x: cp1x, y: cp1y} = transformer({
					x: segment.cp1x,
					y: segment.cp1y,
				});
				const {x: cp2x, y: cp2y} = transformer({
					x: segment.cp2x,
					y: segment.cp2y,
				});

				return [
					{
						type: 'C',
						x,
						y,
						cp1x,
						cp1y,
						cp2x,
						cp2y,
					},
				];
			}

			if (segment.type === 'M') {
				const {x, y} = transformer({x: segment.x, y: segment.y});
				return [
					{
						type: 'M',
						x,
						y,
					},
				];
			}

			return [segment];
		})
		.flat(1);
};

// Add a line from second to last point to last point and then keep Z so it can be transformed as well
export const fixZInstruction = (
	instructions: ReducedInstruction[],
): ReducedInstruction[] => {
	let prevX = 0;
	let prevY = 0;

	return instructions
		.map((instruction): ReducedInstruction[] => {
			if (instruction.type === 'Z') {
				return [
					{
						type: 'L',
						x: prevX,
						y: prevY,
					},
					{
						type: 'Z',
					},
				];
			}

			if (instruction.type === 'M') {
				prevX = instruction.x;
				prevY = instruction.y;
			}

			return [instruction];
		})
		.flat(1);
};
