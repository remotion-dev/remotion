import {ServerlessRoutines} from '@remotion/serverless/client';
import {expect, test} from 'vitest';
import {callLambdaSync} from '../../shared/call-lambda-sync';

test('Info handler should return version', async () => {
	const response = await callLambdaSync({
		type: ServerlessRoutines.info,
		payload: {
			logLevel: 'info',
		},
		functionName: 'remotion-dev-lambda',
		region: 'us-east-1',
		timeoutInTest: 120000,
	});

	expect(typeof response.version === 'string').toBe(true);
});
