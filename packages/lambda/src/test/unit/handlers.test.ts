import {expect, test} from 'bun:test';
import {
	LambdaClientInternals,
	ServerlessRoutines,
} from '@remotion/lambda-client';
import {useFakeAws} from '../mocks/fake-aws';

useFakeAws();

test('Info handler should return version', async () => {
	const response = await LambdaClientInternals.callFunctionSyncImplementation({
		type: ServerlessRoutines.info,
		payload: {
			logLevel: 'info',
			type: ServerlessRoutines.info,
		},
		functionName: 'remotion-dev-lambda',
		region: 'us-east-1',
		timeoutInTest: 120000,
		requestHandler: null,
	});

	expect(typeof response.version === 'string').toBe(true);
});
