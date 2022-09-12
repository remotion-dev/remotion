import {expect, test} from 'vitest';
import {smoothenZoom, unsmoothenZoom} from '../smooth-zoom';

test('Smoothen zoom', () => {
	expect(smoothenZoom(0)).toBe(1);
	expect(smoothenZoom(-1)).toBe(0.33287108369807955);
	expect(smoothenZoom(1)).toBe(3.004166023946433);
});

test('Unsmoothen zoom', () => {
	expect(unsmoothenZoom(3.004166023946433)).approximately(1, 0.01);
	expect(unsmoothenZoom(1)).toBe(-0.0953101798043249);
	expect(unsmoothenZoom(0.33287108369807955)).toBe(-1);
	expect(unsmoothenZoom(-1)).toBe(-2.3025850929940455);
});
