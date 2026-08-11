import {expect, test} from 'bun:test';
import {resetPath} from '../reset-path';

test('resetPath()', () => {
	expect(resetPath('M 10 10 L 20 20')).toBe('M 0 0 L 10 10');
});

test('resetPath() with arcs', () => {
	expect(resetPath('M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0')).toBe(
		'M 0 25.000000000000007 a 25 25 0 1 1 50 0 a 25 25 0 1 1 -50 0',
	);
});
