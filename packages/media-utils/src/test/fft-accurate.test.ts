import {expect, test} from 'bun:test';
import {complexAdd, complexMultiply, complexSubtract} from '../fft/complex';
import {exponent} from '../fft/exponent';
import {fftAccurate} from '../fft/fft-accurate';

// The recursive transform from node-fft that fftAccurate() used before
const recursiveFft = (vector: number[]): [number, number][] => {
	const N = vector.length;
	if (N === 1) {
		return [[vector[0], 0]];
	}

	const evens = recursiveFft(vector.filter((_, i) => i % 2 === 0));
	const odds = recursiveFft(vector.filter((_, i) => i % 2 === 1));
	const X: [number, number][] = [];
	for (let k = 0; k < N / 2; k++) {
		const e = complexMultiply(exponent(k, N), odds[k]);
		X[k] = complexAdd(evens[k], e);
		X[k + N / 2] = complexSubtract(evens[k], e);
	}

	return X;
};

let seed = 1;
const random = () => {
	seed = (seed * 16807) % 2147483647;
	return seed / 2147483647;
};

test('fftAccurate() is bit-identical to the recursive transform', () => {
	for (let N = 1; N <= 4096; N *= 2) {
		const inputs = [
			Array.from({length: N}, () => Math.round(random() * 65535) - 32768),
			Array.from({length: N}, (_, i) =>
				Math.round(Math.sin(i / 3) * 20000 + Math.sin(i * 1.7) * 9000),
			),
			Array.from({length: N}, (_, i) => (i % 2 ? -32768 : 32767)),
			Array.from({length: N}, (_, i) => (i === 0 ? 32767 : 0)),
			new Array(N).fill(0),
		];

		for (const input of inputs) {
			const actual = fftAccurate(Int16Array.from(input)).flat();
			const expected = recursiveFft(input).flat();
			expect(actual.length).toBe(expected.length);
			for (let i = 0; i < expected.length; i++) {
				if (!Object.is(actual[i], expected[i])) {
					throw new Error(
						`N=${N}, index ${i}: got ${actual[i]}, expected ${expected[i]}`,
					);
				}
			}
		}
	}
});
