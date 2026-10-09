import {expect, test} from 'bun:test';
import {parsePath} from '../parse-path';

test('Should be able to parse path', () => {
	expect(parsePath('M 100 100')).toEqual([{type: 'M', x: 100, y: 100}]);
	expect(parsePath('M 100 100L 200 200')).toEqual([
		{type: 'M', x: 100, y: 100},
		{type: 'L', x: 200, y: 200},
	]);
});

test('Should catch invalid paths', () => {
	expect(() => parsePath('M 100 100L 200 200L')).toThrow(
		/Malformed path data: L was expected to have numbers afterwards/,
	);
});

test('Should parse arc flags without separators', () => {
	expect(parsePath('M 0 0 A 1 1 0 0140 40')).toEqual([
		{type: 'M', x: 0, y: 0},
		{
			type: 'A',
			rx: 1,
			ry: 1,
			xAxisRotation: 0,
			largeArcFlag: false,
			sweepFlag: true,
			x: 40,
			y: 40,
		},
	]);
	expect(parsePath('M10 10a20 20 0 0140 40 20 20 0 1140-40')).toEqual(
		parsePath('M10 10a20 20 0 0 1 40 40 20 20 0 1 1 40 -40'),
	);
	expect(() => parsePath('M 0 0 A 1 1 0 2 1 40 40')).toThrow(
		/Malformed path data: A has an invalid value at "2 1 40 40"/,
	);
});
