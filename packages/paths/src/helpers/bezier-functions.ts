import {binomialCoefficients, cValues, tValues} from './bezier-values';
import {getCubicRoots} from './polynomial-roots';
import type {Point} from './types';
export const cubicPoint = (xs: number[], ys: number[], t: number): Point => {
	const x =
		(1 - t) * (1 - t) * (1 - t) * xs[0] +
		3 * (1 - t) * (1 - t) * t * xs[1] +
		3 * (1 - t) * t * t * xs[2] +
		t * t * t * xs[3];
	const y =
		(1 - t) * (1 - t) * (1 - t) * ys[0] +
		3 * (1 - t) * (1 - t) * t * ys[1] +
		3 * (1 - t) * t * t * ys[2] +
		t * t * t * ys[3];

	return {x, y};
};

export const cubicDerivative = (xs: number[], ys: number[], t: number) => {
	const derivative = quadraticPoint(
		[3 * (xs[1] - xs[0]), 3 * (xs[2] - xs[1]), 3 * (xs[3] - xs[2])],
		[3 * (ys[1] - ys[0]), 3 * (ys[2] - ys[1]), 3 * (ys[3] - ys[2])],
		t
	);
	return derivative;
};

export const getCubicArcLength = (xs: number[], ys: number[], t: number) => {
	let correctedT: number;

	const n = 20;

	const z = t / 2;
	let sum = 0;
	for (let i = 0; i < n; i++) {
		correctedT = z * tValues[n][i] + z;
		sum += cValues[n][i] * bFunc(xs, ys, correctedT);
	}

	return z * sum;
};

export const quadraticPoint = (
	xs: number[],
	ys: number[],
	t: number
): Point => {
	const x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
	const y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
	return {x, y};
};

export const getQuadraticArcLength = (
	xs: number[],
	ys: number[],
	t: number
) => {
	if (t === undefined) {
		t = 1;
	}

	const ax = xs[0] - 2 * xs[1] + xs[2];
	const ay = ys[0] - 2 * ys[1] + ys[2];
	const bx = 2 * xs[1] - 2 * xs[0];
	const by = 2 * ys[1] - 2 * ys[0];

	const A = 4 * (ax * ax + ay * ay);
	const B = 4 * (ax * bx + ay * by);
	const C = bx * bx + by * by;

	if (A === 0) {
		return t * Math.sqrt((xs[2] - xs[0]) ** 2 + (ys[2] - ys[0]) ** 2);
	}

	const b = B / (2 * A);
	const c = C / A;
	const u = t + b;
	const k = c - b * b;

	const uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
	const bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
	const term =
		b + Math.sqrt(b * b + k) === 0
			? 0
			: k * Math.log(Math.abs((u + uuk) / (b + bbk)));
	return (Math.sqrt(A) / 2) * (u * uuk - b * bbk + term);
};

export const quadraticDerivative = (xs: number[], ys: number[], t: number) => {
	return {
		x: (1 - t) * 2 * (xs[1] - xs[0]) + t * 2 * (xs[2] - xs[1]),
		y: (1 - t) * 2 * (ys[1] - ys[0]) + t * 2 * (ys[2] - ys[1]),
	};
};

function bFunc(xs: number[], ys: number[], t: number) {
	const xbase = getDerivative(1, t, xs);
	const ybase = getDerivative(1, t, ys);
	const combined = xbase * xbase + ybase * ybase;
	return Math.sqrt(combined);
}

/**
 * Compute the curve derivative (hodograph) at t.
 */
const getDerivative = (derivative: number, t: number, vs: number[]): number => {
	// the derivative of any 't'-less function is zero.
	const n = vs.length - 1;
	let value;

	if (n === 0) {
		return 0;
	}

	// direct values? compute!
	if (derivative === 0) {
		value = 0;
		for (let k = 0; k <= n; k++) {
			value += binomialCoefficients[n][k] * (1 - t) ** (n - k) * t ** k * vs[k];
		}

		return value;
	}

	// Still some derivative? go down one order, then try
	// for the lower order curve's.
	const _vs = new Array(n);
	for (let k = 0; k < n; k++) {
		_vs[k] = n * (vs[k + 1] - vs[k]);
	}

	return getDerivative(derivative - 1, t, _vs);
};

export const t2length = (
	length: number,
	totalLength: number,
	func: (t: number) => number
): number => {
	// originally 1, but it would get stuck in an infinite loop
	// had to increase
	let error = 100;
	let t = length / totalLength;
	let step = (length - func(t)) / totalLength;

	let numIterations = 0;
	while (error > 0.001) {
		const increasedTLength = func(t + step);
		const increasedTError = Math.abs(length - increasedTLength) / totalLength;

		if (increasedTError < error) {
			error = increasedTError;
			t += step;
		} else {
			const decreasedTLength = func(t - step);
			const decreasedTError = Math.abs(length - decreasedTLength) / totalLength;

			if (decreasedTError < error) {
				error = decreasedTError;
				t -= step;
			} else {
				step /= 2;
			}
		}

		numIterations++;
		if (numIterations > 500) {
			throw new Error('Unable to get t2length');
		}
	}

	return t;
};

// Copied from https://github.com/w8r/bezier-intersect
export function cubicBezierLine({
	p1x,
	p1y,
	p2x,
	p2y,
	p3x,
	p3y,
	p4x,
	p4y,
	a1x,
	a1y,
	a2x,
	a2y,
}: {
	p1x: number;
	p1y: number;
	p2x: number;
	p2y: number;
	p3x: number;
	p3y: number;
	p4x: number;
	p4y: number;
	a1x: number;
	a1y: number;
	a2x: number;
	a2y: number;
}) {
	const result: [number, number][] = [];
	let ax;
	let ay;
	let bx;
	let by;
	let cx;
	let cy;
	let dx;
	let dy; // temporary variables

	// used to determine if point is on line segment
	const minx = Math.min(a1x, a2x);
	const miny = Math.min(a1y, a2y);
	const maxx = Math.max(a1x, a2x);
	const maxy = Math.max(a1y, a2y);

	// Start with Bezier using Bernstein polynomials for weighting functions:
	//     (1-t^3)P1 + 3t(1-t)^2P2 + 3t^2(1-t)P3 + t^3P4
	//
	// Expand and collect terms to form linear combinations of original Bezier
	// controls.  This ends up with a vector cubic in t:
	//     (-P1+3P2-3P3+P4)t^3 + (3P1-6P2+3P3)t^2 + (-3P1+3P2)t + P1
	//             /\                  /\                /\       /\
	//             ||                  ||                ||       ||
	//             c3                  c2                c1       c0

	// Calculate the coefficients
	ax = p1x * -1;
	ay = p1y * -1;
	bx = p2x * 3;
	by = p2y * 3;
	cx = p3x * -3;
	cy = p3y * -3;
	dx = ax + bx + cx + p4x;
	dy = ay + by + cy + p4y;
	const c3x = dx;
	const c3y = dy; // vec

	ax = p1x * 3;
	ay = p1y * 3;
	bx = p2x * -6;
	by = p2y * -6;
	cx = p3x * 3;
	cy = p3y * 3;
	dx = ax + bx + cx;
	dy = ay + by + cy;
	const c2x = dx;
	const c2y = dy; // vec

	ax = p1x * -3;
	ay = p1y * -3;
	bx = p2x * 3;
	by = p2y * 3;
	cx = ax + bx;
	cy = ay + by;
	const c1x = cx;
	const c1y = cy; // vec

	const c0x = p1x;
	const c0y = p1y; // coefficients of cubic

	// Convert line to normal form: ax + by + c = 0
	// Find normal to line: negative inverse of original line's slope
	const nx = a1y - a2y;
	const ny = a2x - a1x; // normal for normal form of line

	// Determine new c coefficient
	const cl = a1x * a2y - a2x * a1y; // c coefficient for normal form of line

	// ?Rotate each cubic coefficient using line for new coordinate system?
	// Find roots of rotated cubic
	const roots = getCubicRoots(
		// dot products => x * x + y * y
		nx * c3x + ny * c3y,
		nx * c2x + ny * c2y,
		nx * c1x + ny * c1y,
		nx * c0x + ny * c0y + cl
	);

	// Any roots in closed interval [0,1] are intersections on Bezier, but
	// might not be on the line segment.
	// Find intersections and calculate point coordinates
	for (let i = 0; i < roots.length; i++) {
		const t = roots[i];

		if (t >= 0 && t <= 1) {
			// We're within the Bezier curve
			// Find point on Bezier
			// lerp: x1 + (x2 - x1) * t
			const p5x = p1x + (p2x - p1x) * t;
			const p5y = p1y + (p2y - p1y) * t; // lerp(p1, p2, t);

			const p6x = p2x + (p3x - p2x) * t;
			const p6y = p2y + (p3y - p2y) * t;

			const p7x = p3x + (p4x - p3x) * t;
			const p7y = p3y + (p4y - p3y) * t;

			const p8x = p5x + (p6x - p5x) * t;
			const p8y = p5y + (p6y - p5y) * t;

			const p9x = p6x + (p7x - p6x) * t;
			const p9y = p6y + (p7y - p6y) * t;

			// candidate
			const p10x = p8x + (p9x - p8x) * t;
			const p10y = p8y + (p9y - p8y) * t;

			// See if point is on line segment
			if (a1x === a2x && miny <= p10y && p10y <= maxy) {
				// vertical
				if (result) result.push([p10x, p10y]);
				else break;
			} else if (a1y === a2y && minx <= p10x && p10x <= maxx) {
				// horizontal
				if (result) result.push([p10x, p10y]);
				else break;
			} else if (p10x >= minx && p10y >= miny && p10x <= maxx && p10y <= maxy) {
				if (result) result.push([p10x, p10y]);
				else break;
			}
		}
	}

	return result;
}
