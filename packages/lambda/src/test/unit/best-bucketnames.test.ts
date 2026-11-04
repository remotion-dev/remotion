import {expect, test} from 'bun:test';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {useFakeAws} from '../mocks/fake-aws';

useFakeAws();

test('Generate and parse bucket names correctly', () => {
	const name = LambdaClientInternals.makeBucketName('us-east-1');
	expect(name).toBe('remotionlambda-useast1-abcdef');

	const parsed = LambdaClientInternals.parseBucketName(name);
	expect(parsed).toEqual({region: 'us-east-1'});
});
