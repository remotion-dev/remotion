import {expect, test} from 'vitest';
import {getBundleUrlFromServeUrl} from '../get-bundle-url-from-serve-url';

test('get bundle url from serve url', async () => {
	const expected = getBundleUrlFromServeUrl(
		'https://remotionlambda-gc1w0xbfzl.s3.eu-central-1.amazonaws.com/sites/testbed-v6/index.html'
	);

	expect(expected).toBe(
		'https://remotionlambda-gc1w0xbfzl.s3.eu-central-1.amazonaws.com/sites/testbed-v6/bundle.js'
	);
});
