import {expect, test} from 'vitest';
import {makeDOMMatrix} from '../drawing/make-dom-matrix';

test('Should make a matrix from a multi-component scale', () => {
	const matrix = makeDOMMatrix('scale(2 3)');

	expect(matrix.m11).toBe(2);
	expect(matrix.m22).toBe(3);
	expect(matrix.m33).toBe(1);
	expect(matrix.is2D).toBe(true);
});

test('Should make a matrix from a three-dimensional scale', () => {
	const matrix = makeDOMMatrix('scale(2 3 4)');

	expect(matrix.m11).toBe(2);
	expect(matrix.m22).toBe(3);
	expect(matrix.m33).toBe(4);
	expect(matrix.is2D).toBe(false);
});

test('Should make a matrix from percentage scales', () => {
	const matrix = makeDOMMatrix('scale(50% 75%)');

	expect(matrix.m11).toBe(0.5);
	expect(matrix.m22).toBe(0.75);
});

test.each([
	['x', 'rotateX(45deg)'],
	['y', 'rotateY(45deg)'],
	['z', 'rotate(45deg)'],
])('Should make a matrix from a %s-axis rotation', (axis, transform) => {
	const matrix = makeDOMMatrix(`rotate(${axis} 45deg)`);
	const expected = new DOMMatrix(transform);

	expect(Array.from(matrix.toFloat64Array())).toEqual(
		Array.from(expected.toFloat64Array()),
	);
});

test('Should make a matrix from a vector-axis rotation', () => {
	const matrix = makeDOMMatrix('rotate(1 2 3 45deg)');
	const expected = new DOMMatrix('rotate3d(1, 2, 3, 45deg)');

	expect(Array.from(matrix.toFloat64Array())).toEqual(
		Array.from(expected.toFloat64Array()),
	);
});

test('Should pass other transforms to DOMMatrix', () => {
	const matrix = makeDOMMatrix('matrix(2, 0, 0, 3, 4, 5)');

	expect(matrix.m11).toBe(2);
	expect(matrix.m22).toBe(3);
	expect(matrix.m41).toBe(4);
	expect(matrix.m42).toBe(5);
});
