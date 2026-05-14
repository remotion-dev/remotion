import {expect, test} from 'bun:test';
import {truncateSrcForLabel} from '../Img.js';

test('leaves http URLs untouched', () => {
	const src = 'https://example.com/images/hero.png';
	expect(truncateSrcForLabel(src)).toBe(src);
});

test('leaves file:// URLs untouched', () => {
	const src = 'file:///tmp/foo.jpg';
	expect(truncateSrcForLabel(src)).toBe(src);
});

test('leaves short data URLs untouched', () => {
	const src =
		'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
	expect(src.length).toBeLessThanOrEqual(100);
	expect(truncateSrcForLabel(src)).toBe(src);
});

test('truncates large data URLs', () => {
	const huge = 'data:image/png;base64,' + 'A'.repeat(2_000_000);
	const result = truncateSrcForLabel(huge);

	expect(result.length).toBeLessThan(200);
	expect(result.startsWith('data:image/png;base64,')).toBe(true);
	expect(result).toContain('[' + huge.length + ' chars total]');
});
