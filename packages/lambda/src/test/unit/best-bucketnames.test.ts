import {expect, test} from 'vitest';
import {
	makeBucketName,
	parseBucketName,
} from '../../shared/validate-bucketname';

test('Generate and parse bucket names correctly', () => {
	const name = makeBucketName('us-east-1');
	expect(name).toBe('remotionlambda-useast1-abcdef');

	const parsed = parseBucketName(name);
	expect(parsed).toEqual({region: 'us-east-1'});
});
