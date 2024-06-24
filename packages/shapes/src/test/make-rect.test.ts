import {expect, test} from 'bun:test';
import {makeRect} from '../utils/make-rect';

test('Should be able to make a rect path', () => {
	const rect = makeRect({width: 100, height: 100});
	expect(rect).toEqual({
		height: 100,
		width: 100,
		path: 'M 0 0 L 100 0 L 100 100 L 0 100 L 0 0 Z',
		transformOrigin: '50 50',
		instructions: [
			{type: 'M', x: 0, y: 0},
			{type: 'L', x: 100, y: 0},
			{type: 'L', x: 100, y: 100},
			{type: 'L', x: 0, y: 100},
			{type: 'L', x: 0, y: 0},
			{type: 'Z'},
		],
	});
});

test('Should handle rectangle path with radius', () => {
	const rect = makeRect({width: 100, height: 100, cornerRadius: 20});

	expect(rect).toEqual({
		height: 100,
		width: 100,
		path: 'M 80 0 L 80 0 a 20 20 0 0 1 20 20 L 100 80 a 20 20 0 0 1 -20 20 L 20 100 a 20 20 0 0 1 -20 -20 L 0 20 a 20 20 0 0 1 20 -20 Z',
		transformOrigin: '50 50',
		instructions: expect.any(Array),
	});
});
