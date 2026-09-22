import {expect, test} from 'bun:test';
import {staticFileRef} from '../index';

test('returns the preview source for a declared public path', () => {
	expect(
		staticFileRef({
			path: 'product-card/logo.png',
			previewSrc: 'https://example.com/logo.png',
		}),
	).toBe('https://example.com/logo.png');
});

test('rejects invalid paths and preview sources', () => {
	expect(() =>
		staticFileRef({path: '../logo.png', previewSrc: '/logo.png'}),
	).toThrow();
	expect(() => staticFileRef({path: 'logo.png', previewSrc: ''})).toThrow();
	expect(() =>
		staticFileRef({path: 'logo.png', previewSrc: null as unknown as string}),
	).toThrow();
});
