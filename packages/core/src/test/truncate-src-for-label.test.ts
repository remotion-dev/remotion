import {expect, test} from 'bun:test';
import {truncateSrcForLabel} from '../truncate-src-for-label.js';

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

test('truncates large blob URLs', () => {
	const hugeBlob = 'blob:https://example.com/' + 'B'.repeat(500);
	const result = truncateSrcForLabel(hugeBlob);

	expect(result.length).toBeLessThan(200);
	expect(result.startsWith('blob:https://example.com/')).toBe(true);
	expect(result).toContain('[' + hugeBlob.length + ' chars total]');
});

test('stringifies non-string inputs for diagnostic labels', () => {
	expect(truncateSrcForLabel(null as unknown as string)).toBe('null');
	expect(truncateSrcForLabel(undefined as unknown as string)).toBe('undefined');
	expect(truncateSrcForLabel(123 as unknown as string)).toBe('123');
});
