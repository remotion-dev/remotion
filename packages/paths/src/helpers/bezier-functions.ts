import {binomialCoefficients, cValues, tValues} from './bezier-values';
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

function bFunc(xs: number[], ys: number[], t: number) {
	const xbase = getDerivative(1, t, xs);
	const ybase = getDerivative(1, t, ys);
	const combined = xbase * xbase + ybase * ybase;
	return Math.sqrt(combined);
}

export const getCubicArcLength = ({
	sx,
	sy,
	t,
}: {
	sx: number[];
	sy: number[];
	t: number;
}) => {
	let correctedT: number;

	const n = 20;

	const z = t / 2;
	let sum = 0;
	for (let i = 0; i < n; i++) {
		correctedT = z * tValues[n][i] + z;
		sum += cValues[n][i] * bFunc(sx, sy, correctedT);
	}

	return z * sum;
};

export const quadraticPoint = (
	xs: number[],
	ys: number[],
	t: number,
): Point => {
	const x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
	const y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
	return {x, y};
};

export const cubicDerivative = (xs: number[], ys: number[], t: number) => {
	const derivative = quadraticPoint(
		[3 * (xs[1] - xs[0]), 3 * (xs[2] - xs[1]), 3 * (xs[3] - xs[2])],
		[3 * (ys[1] - ys[0]), 3 * (ys[2] - ys[1]), 3 * (ys[3] - ys[2])],
		t,
	);
	return derivative;
};

export const getQuadraticArcLength = (
	xs: number[],
	ys: number[],
	t: number,
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

export const t2length = ({
	length,
	totalLength,
	func,
}: {
	length: number;
	totalLength: number;
	func: (t: number) => number;
}): number => {
	let error = 1;
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
			break;
		}
	}

	return t;
};
