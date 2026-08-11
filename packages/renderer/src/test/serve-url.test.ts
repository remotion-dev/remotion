import {expect, test} from 'bun:test';
import {normalizeServeUrl} from '../normalize-serve-url';

test('normalizeServeUrl', () => {
	expect(
		normalizeServeUrl(
			'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing?somequery',
		),
	).toBe(
		'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
	);
	expect(
		normalizeServeUrl(
			'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
		),
	).toBe(
		'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
	);
	expect(
		normalizeServeUrl(
			'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing',
		),
	).toBe(
		'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
	);
	expect(
		normalizeServeUrl(
			'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/?hi=there',
		),
	).toBe(
		'https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
	);
});
