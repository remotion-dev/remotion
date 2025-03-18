import {ServerlessRoutines} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {VERSION} from 'remotion/version';
import {mockImplementation} from '../mocks/mock-implementation';

test('Call function locally', async () => {
	expect(
		await mockImplementation.callFunctionSync({
			payload: {
				type: ServerlessRoutines.info,
				logLevel: 'info',
			},
			type: ServerlessRoutines.info,
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			timeoutInTest: 120000,
		}),
	).toEqual({type: 'success', version: VERSION});
});
