import {expect, test} from 'vitest';
import {interpolatePath} from '../interpolate-path';

test('Should be able to interpolate path', () => {
	expect(interpolatePath(0.5, 'M 0 0 L 100 0', 'M 100 0 L 0 0')).toBe(
		'M50,0L50,0'
	);
	expect(interpolatePath(0, 'M 0 0 L 100 0', 'M 100 0 L 0 0')).toBe(
		'M 0 0 L 100 0'
	);
	expect(interpolatePath(1, 'M 0 0 L 100 0', 'M 100 0 L 0 0')).toBe(
		'M 100 0 L 0 0'
	);
});
