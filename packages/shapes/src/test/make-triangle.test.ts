import {expect, test} from 'vitest';
import {makeTriangle} from '../utils/make-triangle';

test('Should be able to make a triangle path', () => {
	const rightTriangle = makeTriangle({
		length: 100,
		direction: 'right',
	});

	expect(rightTriangle).toEqual({
		width: 86.60254037844386,
		height: 100,
		path: 'M 0 0 L 0 100 L 86.60254037844386 50 L 0 0 Z',
		transformOrigin: '28.867513459481287 50',
		instructions: [
			{type: 'M', x: 0, y: 0},
			{type: 'L', x: 0, y: 100},
			{type: 'L', x: 86.60254037844386, y: 50},
			{type: 'L', x: 0, y: 0},
			{type: 'Z'},
		],
	});
});

test('Should handle triangle path with radius', () => {
	const rightTriangle = makeTriangle({
		length: 100,
		direction: 'right',
		cornerRadius: 60,
	});

	expect(rightTriangle).toEqual({
		height: 100,
		path: 'M 0 40 L 0 40 C 0 100 0 100 51.96152422706631 70 L 34.64101615137755 80 C 86.60254037844386 50 86.60254037844386 50 34.64101615137755 20 L 51.96152422706631 30 C 0 0 0 0 0 60 Z',
		transformOrigin: '28.867513459481287 50',
		instructions: expect.any(Array),
		width: 86.60254037844386,
	});
});

test('Should handle triangle path with radius with direction up', () => {
	const upTriangle = makeTriangle({
		length: 100,
		direction: 'up',
		cornerRadius: 60,
	});

	expect(upTriangle).toEqual({
		height: 86.60254037844386,
		instructions: expect.any(Array),
		path: 'M 30 34.64101615137755 L 30 34.64101615137755 C 0 86.60254037844386 0 86.60254037844386 60 86.60254037844386 L 40 86.60254037844386 C 100 86.60254037844386 100 86.60254037844386 70 34.64101615137755 L 80 51.96152422706631 C 50 0 50 0 20 51.96152422706631 Z',
		transformOrigin: '50 57.735026918962575',
		width: 100,
	});
});
