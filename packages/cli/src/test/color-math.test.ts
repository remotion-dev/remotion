import {ZColorInternals} from '@remotion/z-color';
import {expect, test} from 'vitest';

test('Color math', () => {
	expect(ZColorInternals.parseColor('rgba(255, 255, 255, 0.5)')).toEqual({
		a: 128,
		r: 255,
		b: 255,
		g: 255,
	});
});
