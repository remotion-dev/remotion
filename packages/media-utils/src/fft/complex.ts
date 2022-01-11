// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

export const complexAdd = (
	a: [number, number],
	b: [number, number]
): [number, number] => {
	return [a[0] + b[0], a[1] + b[1]];
};

export const complexSubtract = (
	a: [number, number],
	b: [number, number]
): [number, number] => {
	return [a[0] - b[0], a[1] - b[1]];
};

export const complexMultiply = (
	a: [number, number],
	b: [number, number]
): [number, number] => {
	return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
};

export const complexMagnitude = (c: [number, number]): number => {
	return Math.sqrt(c[0] * c[0] + c[1] * c[1]);
};
