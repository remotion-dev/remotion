import {makeBucketName} from '@remotion/serverless/client';
import {expect, test} from 'vitest';
import {parseBucketName} from '../../shared/validate-bucketname';
import {mockImplementation} from '../mock-implementation';

test('Generate and parse bucket names correctly', () => {
	const name = makeBucketName('us-east-1', mockImplementation);
	expect(name).toBe('remotionlambda-useast1-abcdef');

	const parsed = parseBucketName(name);
	expect(parsed).toEqual({region: 'us-east-1'});
});
