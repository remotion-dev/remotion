import {expect, test} from 'bun:test';
import {encodeAwsUrlParams} from '../encode-aws-url-params';

test('Encode AWS URL test', () => {
	const params = encodeAwsUrlParams('"method=test"');
	expect(params).toBe('$2522method$253Dtest$2522');
});
