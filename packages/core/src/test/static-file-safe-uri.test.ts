import {expect, test} from 'vitest';
import {staticFile} from '../static-file.js';

test('staticFile() should convert # into %23', () => {
	const unsafeName = 'test/example#music';
	expect(staticFile(unsafeName)).toBe('/test/example%23music');
});

test('staticFile() passing already encoded path should give warning', () => {
	const unsafeName = '/test%2Fexample%23music';
	expect(staticFile(unsafeName)).toBe('/test%252Fexample%2523music');
});

test('staticFile() should not encode slashes', () => {
	const nameWithSlashes = '/test/example/word';
	expect(staticFile(nameWithSlashes)).toBe(nameWithSlashes);
});

test('staticFile() should encode all problematic characters except slashes', () => {
	const nameWithSlashes = '/test/#example/$word';
	expect(staticFile(nameWithSlashes)).toBe('/test/%23example/%24word');
});
