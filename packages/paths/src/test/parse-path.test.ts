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
