import {expect, test} from 'bun:test';
import path from 'path';
import {
	getBundleMapUrlFromServeUrl,
	getBundleUrlFromServeUrl,
} from '../get-bundle-url-from-serve-url';

test('get bundle url from serve url', () => {
	const expected = getBundleUrlFromServeUrl(
		'https://remotionlambda-gc1w0xbfzl.s3.eu-central-1.amazonaws.com/sites/testbed-v6/index.html',
	);

	expect(expected).toBe(
		'https://remotionlambda-gc1w0xbfzl.s3.eu-central-1.amazonaws.com/sites/testbed-v6/bundle.js',
	);
});

test('get bundle url from localhost', () => {
	const expected = getBundleUrlFromServeUrl('http://localhost:3000');

	expect(expected).toBe('http://localhost:3000/bundle.js');
});

test('get bundle url from localhost with bundle.js', () => {
	const expected = getBundleMapUrlFromServeUrl(
		'http://localhost:3000/bundle.js',
	);

	expect(expected).toBe('http://localhost:3000/bundle.js.map');
});

test('get bundle url from localhost with bundle.js', () => {
	const expected = getBundleMapUrlFromServeUrl('http://localhost:3000/');

	expect(expected).toBe('http://localhost:3000/bundle.js.map');
});

test('get bundle url from localhost with bundle.js', () => {
	const expected = getBundleMapUrlFromServeUrl(
		'http://localhost:3000/hithere/index.html',
	);

	expect(expected).toBe('http://localhost:3000/hithere/bundle.js.map');
});

test('get bundle url from local path', () => {
	const expected = getBundleMapUrlFromServeUrl(
		`${path.sep}var${path.sep}bundle`,
	);

	expect(expected).toBe(`${path.sep}var${path.sep}bundle.js.map`);
});
test('get bundle url from local path index.html', () => {
	const expected = getBundleMapUrlFromServeUrl(
		path.join('var', 'bundle', 'index.html'),
	);

	expect(expected).toBe(`var${path.sep}bundle${path.sep}bundle.js.map`);
});
