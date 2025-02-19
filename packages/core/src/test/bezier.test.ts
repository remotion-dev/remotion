import {expect, test} from 'bun:test';
import {bezier} from '../bezier.js';

const identity = (x: number) => {
	return x;
};

const assertClose = (a: number, b: number, precision = 3) => {
	expect(a).toBeCloseTo(b, precision);
};

const allEquals = (
	be1: (x: number) => number,
	be2: (x: number) => number,
	samples: number,
) => {
	for (let i = 0; i <= samples; ++i) {
		const x = i / samples;
		assertClose(be1(x), be2(x));
	}
};

function repeat(n: number) {
	return function (f: Function) {
		for (let i = 0; i < n; ++i) {
			f();
		}
	};
}

test('bezier - should create an object', () => {
	expect(typeof bezier(0, 0, 1, 1) === 'function').toBe(true);
});

test('bezier - fail with wrong params', () => {
	const valuesToTest: [number, number, number, number][] = [
		[0.5, 0.5, -5, 0.5],
		[0.5, 0.5, 5, 0.5],
		[-2, 0.5, 0.5, 0.5],
		[2, 0.5, 0.5, 0.5],
	];

	valuesToTest.forEach((entry) => {
		expect(() => bezier(entry[0], entry[1], entry[2], entry[3])).toThrow();
	});
});

test('bezier - linear curves', () => {
	allEquals(bezier(0, 0, 1, 1), bezier(1, 1, 0, 0), 100);
	allEquals(bezier(0, 0, 1, 1), identity, 100);
});

test('bezier - right value at extremes', () => {
	repeat(10)(() => {
		const a = Math.random();
		const b = 2 * Math.random() - 0.5;
		const c = Math.random();
		const d = 2 * Math.random() - 0.5;
		const easing = bezier(a, b, c, d);
		expect(easing(0)).toBe(0);
		expect(easing(1)).toBe(1);
	});
});
