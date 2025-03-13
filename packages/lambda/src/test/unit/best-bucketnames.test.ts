import {LambdaClientInternals} from '@remotion/lambda-client';
import {makeBucketName} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {mockImplementation} from '../mocks/mock-implementation';

test('Generate and parse bucket names correctly', () => {
	const name = makeBucketName('us-east-1', mockImplementation);
	expect(name).toBe('remotionlambda-useast1-abcdef');

	const parsed = LambdaClientInternals.parseBucketName(name);
	expect(parsed).toEqual({region: 'us-east-1'});
});
