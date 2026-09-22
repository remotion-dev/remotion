import {expect, test} from 'bun:test';
import {staticFileRef} from '../index';

test('returns the preview source for a declared public path', () => {
	expect(
		staticFileRef('product-card/logo.png', 'https://example.com/logo.png'),
	).toBe('https://example.com/logo.png');
});

test('rejects invalid paths and preview sources', () => {
	expect(() => staticFileRef('../logo.png', '/logo.png')).toThrow();
	expect(() => staticFileRef('logo.png', '')).toThrow();
	expect(() => staticFileRef('logo.png', null as unknown as string)).toThrow();
});
