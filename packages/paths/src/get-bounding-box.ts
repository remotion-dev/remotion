'use strict';

import type {BoundingBox} from './helpers/types';
import {normalizePath} from './normalize-path';
import {unarc} from './unarc';
import {unshort} from './unshort';

type minMax = [min: number, max: number];

// Precision for consider cubic polynom as quadratic one
const CBEZIER_MINMAX_EPSILON = 0.00000001;

// https://github.com/kpym/SVGPathy/blob/acd1a50c626b36d81969f6e98e8602e128ba4302/lib/box.js#L89
function minmaxQ(A: [number, number, number]): minMax {
	const min = Math.min(A[0], A[2]);
	const max = Math.max(A[0], A[2]);

	if (A[1] > A[0] ? A[2] >= A[1] : A[2] <= A[1]) {
		// if no extremum in ]0,1[
		return [min, max];
	}

	// check if the extremum E is min or max
	const E = (A[0] * A[2] - A[1] * A[1]) / (A[0] - 2 * A[1] + A[2]);
	return E < min ? [E, max] : [min, E];
}

// https://github.com/kpym/SVGPathy/blob/acd1a50c626b36d81969f6e98e8602e128ba4302/lib/box.js#L127
function minmaxC(A: [number, number, number, number]): minMax {
	const K = A[0] - 3 * A[1] + 3 * A[2] - A[3];

	// if the polynomial is (almost) quadratic and not cubic
	if (Math.abs(K) < CBEZIER_MINMAX_EPSILON) {
		if (A[0] === A[3] && A[0] === A[1]) {
			// no curve, point targeting same location
			return [A[0], A[3]];
		}

		return minmaxQ([
			A[0],
			-0.5 * A[0] + 1.5 * A[1],
			A[0] - 3 * A[1] + 3 * A[2],
		]);
	}

	// the reduced discriminant of the derivative
	const T =
		-A[0] * A[2] +
		A[0] * A[3] -
		A[1] * A[2] -
		A[1] * A[3] +
		A[1] * A[1] +
		A[2] * A[2];

	// if the polynomial is monotone in [0,1]
	if (T <= 0) {
		return [Math.min(A[0], A[3]), Math.max(A[0], A[3])];
	}

	const S = Math.sqrt(T);

	// potential extrema
	let min = Math.min(A[0], A[3]);
	let max = Math.max(A[0], A[3]);

	const L = A[0] - 2 * A[1] + A[2];
	// check local extrema
	for (let R = (L + S) / K, i = 1; i <= 2; R = (L - S) / K, i++) {
		if (R > 0 && R < 1) {
			// if the extrema is for R in [0,1]
			const Q =
				A[0] * (1 - R) * (1 - R) * (1 - R) +
				A[1] * 3 * (1 - R) * (1 - R) * R +
				A[2] * 3 * (1 - R) * R * R +
				A[3] * R * R * R;
			if (Q < min) {
				min = Q;
			}

			if (Q > max) {
				max = Q;
			}
		}
	}

	return [min, max];
}

export const getBoundingBox = (d: string): BoundingBox => {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	const abs = normalizePath(d);
	const unarced = unarc(abs);
	const unshortened = unshort(unarced);

	let x = 0;
	let y = 0;

	for (const seg of unshortened) {
		switch (seg[0]) {
			case 'M':
			case 'L': {
				if (minX > seg[1]) {
					minX = seg[1];
				}

				if (minY > seg[2]) {
					minY = seg[2];
				}

				if (maxX < seg[1]) {
					maxX = seg[1];
				}

				if (maxY < seg[2]) {
					maxY = seg[2];
				}

				x = seg[1];
				y = seg[2];

				break;
			}

			case 'V': {
				if (minY > seg[1]) {
					minY = seg[1];
				}

				if (maxY < seg[1]) {
					maxY = seg[1];
				}

				y = seg[1];

				break;
			}

			case 'H': {
				if (minX > seg[1]) {
					minX = seg[1];
				}

				if (maxX < seg[1]) {
					maxX = seg[1];
				}

				x = seg[1];

				break;
			}

			case 'C': {
				const cxMinMax = minmaxC([x, seg[1], seg[3], seg[5]]);
				if (minX > cxMinMax[0]) {
					minX = cxMinMax[0];
				}

				if (maxX < cxMinMax[1]) {
					maxX = cxMinMax[1];
				}

				const cyMinMax = minmaxC([y, seg[2], seg[4], seg[6]]);
				if (minY > cyMinMax[0]) {
					minY = cyMinMax[0];
				}

				if (maxY < cyMinMax[1]) {
					maxY = cyMinMax[1];
				}

				x = seg[5];
				y = seg[6];

				break;
			}

			case 'Q': {
				const qxMinMax = minmaxQ([x, seg[1], seg[3]]);
				if (minX > qxMinMax[0]) {
					minX = qxMinMax[0];
				}

				if (maxX < qxMinMax[1]) {
					maxX = qxMinMax[1];
				}

				const qyMinMax = minmaxQ([y, seg[2], seg[4]]);
				if (minY > qyMinMax[0]) {
					minY = qyMinMax[0];
				}

				if (maxY < qyMinMax[1]) {
					maxY = qyMinMax[1];
				}

				x = seg[3];
				y = seg[4];

				break;
			}

			default:
				throw new Error(`Unknown instruction ${seg[0]}`);
		}
	}

	return {x1: minX, y1: minY, x2: maxX, y2: maxY};
};
