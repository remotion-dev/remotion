import {expect, test} from 'bun:test';
import {smoothenZoom, unsmoothenZoom} from '../helpers/smooth-zoom';

test('Smoothen zoom', () => {
	expect(smoothenZoom(0)).toBe(1.4715177646857693);
	expect(smoothenZoom(-1)).toBe(2.1653645317858032);
	expect(smoothenZoom(1)).toBe(1);
});

test('Unsmoothen zoom', () => {
	expect(unsmoothenZoom(3.004166023946433)).toBe(0.05);
	expect(unsmoothenZoom(1)).toBe(1);
	expect(unsmoothenZoom(0.33287108369807955)).toBe(3.8475693945182985);
	expect(unsmoothenZoom(-1)).toBe(10);
});
