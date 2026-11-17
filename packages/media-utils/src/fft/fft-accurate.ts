// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

import {exponent} from './exponent';

// Iterative form of node-fft's recursive radix-2 transform. It runs the same
// butterflies with the same twiddle factors in the same arithmetic order, so
// the output is bit-identical, without allocating sub-arrays and tuples at
// every level of the recursion.
export const fftAccurate = function (vector: Int16Array): [number, number][] {
	const N = vector.length;
	const real = new Float64Array(N);
	const imag = new Float64Array(N);

	// The recursion splits even and odd samples until single samples remain,
	// which puts them in bit-reversed order.
	for (let i = 0, j = 0; i < N; i++) {
		real[i] = vector[j];

		let bit = N >> 1;
		while (j & bit) {
			j ^= bit;
			bit >>= 1;
		}

		j |= bit;
	}

	for (let size = 2; size <= N; size *= 2) {
		const half = size / 2;
		for (let k = 0; k < half; k++) {
			const [wReal, wImag] = exponent(k, size);
			for (let even = k; even < N; even += size) {
				const odd = even + half;
				const tReal = real[even];
				const tImag = imag[even];
				const eReal = wReal * real[odd] - wImag * imag[odd];
				const eImag = wReal * imag[odd] + wImag * real[odd];

				real[even] = tReal + eReal;
				imag[even] = tImag + eImag;
				real[odd] = tReal - eReal;
				imag[odd] = tImag - eImag;
			}
		}
	}

	const X: [number, number][] = new Array(N);
	for (let i = 0; i < N; i++) {
		X[i] = [real[i], imag[i]];
	}

	return X;
};
