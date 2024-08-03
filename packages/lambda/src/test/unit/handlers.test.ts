import {ServerlessRoutines} from '@remotion/serverless/client';
import {expect, test} from 'vitest';
import {callLambda} from '../../shared/call-lambda';

test('Info handler should return version', async () => {
	const response = await callLambda({
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
