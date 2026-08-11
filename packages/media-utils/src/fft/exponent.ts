// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

const mapExponent: {
	[key: number]: {
		[key: number]: [number, number];
	};
} = {};

export const exponent = function (k: number, N: number): [number, number] {
	const x = -2 * Math.PI * (k / N);

	mapExponent[N] = mapExponent[N] || {};
	mapExponent[N][k] = mapExponent[N][k] || [Math.cos(x), Math.sin(x)]; // [Real, Imaginary]

	return mapExponent[N][k];
};
