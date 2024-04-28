// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

import {complexAdd, complexMultiply, complexSubtract} from './complex';
import {exponent} from './exponent';

export const fftAccurate = function (vector: Int16Array): [number, number][] {
	const X: [number, number][] = [];
	const N = vector.length;

	// Base case is X = x + 0i since our input is assumed to be real only.
	if (N === 1) {
		if (Array.isArray(vector[0])) {
			// If input vector contains complex numbers
			return [[vector[0][0], vector[0][1]]];
		}

		return [[vector[0], 0]];
	}

	// Recurse: all even samples
	const X_evens = fftAccurate(vector.filter((_, ix) => ix % 2 === 0));
	// Recurse: all odd samples
	const X_odds = fftAccurate(vector.filter((__, ix) => ix % 2 === 1));

	// Now, perform N/2 operations!
	for (let k = 0; k < N / 2; k++) {
		// t is a complex number!
		const t = X_evens[k];
		const e = complexMultiply(exponent(k, N), X_odds[k]);

		X[k] = complexAdd(t, e);
		X[k + N / 2] = complexSubtract(t, e);
	}

	return X;
};
