import {expect, test} from 'bun:test';
import {
	LambdaClientInternals,
	ServerlessRoutines,
} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';
import {useFakeAws} from '../mocks/fake-aws';

useFakeAws();

test('Call function locally', async () => {
	expect(
		await LambdaClientInternals.callFunctionSyncImplementation({
			payload: {
				type: ServerlessRoutines.info,
				logLevel: 'info',
			},
			type: ServerlessRoutines.info,
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			timeoutInTest: 120000,
			requestHandler: null,
		}),
	).toEqual({type: 'success', version: VERSION});
});
