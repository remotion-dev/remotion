import {expect, test} from 'bun:test';
import {makeCallout} from '../utils/make-callout';

test('Should be able to make a callout path', () => {
	const callout = makeCallout({
		width: 300,
		height: 120,
		pointerLength: 40,
		pointerBaseWidth: 60,
		pointerPosition: 0.5,
		pointerDirection: 'up',
	});

	expect(callout).toEqual({
		height: 160,
		width: 300,
		path: 'M 0 40 L 120 40 L 150 0 L 180 40 L 300 40 L 300 160 L 0 160 L 0 40 Z',
		transformOrigin: '150 100',
		instructions: [
			{type: 'M', x: 0, y: 40},
			{type: 'L', x: 120, y: 40},
			{type: 'L', x: 150, y: 0},
			{type: 'L', x: 180, y: 40},
			{type: 'L', x: 300, y: 40},
			{type: 'L', x: 300, y: 160},
			{type: 'L', x: 0, y: 160},
			{type: 'L', x: 0, y: 40},
			{type: 'Z'},
		],
	});
});

test('Should include the pointer in right callout dimensions', () => {
	const callout = makeCallout({
		width: 300,
		height: 120,
		pointerLength: 40,
		pointerBaseWidth: 60,
		pointerDirection: 'right',
	});

	expect(callout.width).toBe(340);
	expect(callout.height).toBe(120);
	expect(callout.transformOrigin).toBe('150 60');
	expect(callout.path).toBe(
		'M 0 0 L 300 0 L 300 30 L 340 60 L 300 90 L 300 120 L 0 120 L 0 0 Z',
	);
});

test('Should handle callout path with radius', () => {
	const callout = makeCallout({
		pointerLength: 40,
		pointerBaseWidth: 60,
		cornerRadius: 20,
	});

	expect(callout).toEqual({
		height: 240,
		width: 500,
		path: 'M 20 0 L 480 0 a 20 20 0 0 1 20 20 L 500 180 a 20 20 0 0 1 -20 20 L 280 200 L 250 240 L 220 200 L 20 200 a 20 20 0 0 1 -20 -20 L 0 20 a 20 20 0 0 1 20 -20 Z',
		transformOrigin: '250 100',
		instructions: expect.any(Array),
	});
});

test('Should return the transform origin in the center of the body', () => {
	for (const [pointerDirection, transformOrigin] of [
		['up', '150 100'],
		['down', '150 60'],
		['left', '190 60'],
		['right', '150 60'],
	] as const) {
		expect(
			makeCallout({
				width: 300,
				height: 120,
				pointerLength: 40,
				pointerDirection,
			}).transformOrigin,
		).toBe(transformOrigin);
	}
});

test('Should validate callout pointerPosition', () => {
	expect(() =>
		makeCallout({
			pointerPosition: 1.5,
		}),
	).toThrow(/pointerPosition/);
});

test('Should support edge pointer positions with corner radius', () => {
	const callout = makeCallout({
		pointerPosition: 0,
		cornerRadius: 10,
	});

	expect(callout.path).not.toContain('NaN');
});

test('Should not round the pointer join when left pointer is on the edge', () => {
	const callout = makeCallout({
		pointerDirection: 'left',
		pointerPosition: 0,
		cornerRadius: 40,
	});

	expect(callout.path).toBe(
		'M 40 0 L 500 0 a 40 40 0 0 1 40 40 L 540 160 a 40 40 0 0 1 -40 40 L 80 200 a 40 40 0 0 1 -40 -40 L 40 30 L 0 0 Z',
	);
});
