import {expect, test} from 'bun:test';
import {evolvePath} from '../evolve-path';

test('Should be able to interpolate path', () => {
	expect(evolvePath(0.5, 'M 0 0 L 100 0')).toEqual({
		strokeDasharray: '100 100',
		strokeDashoffset: 50,
	});
});
