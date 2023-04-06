import {expect, test} from 'vitest';
import {parseColor} from '../color-math';

test('Color math', () => {
	expect(parseColor('rgba(255, 255, 255, 0.5)')).toEqual({
		a: 128,
		r: 255,
		b: 255,
		g: 255,
	});
});
