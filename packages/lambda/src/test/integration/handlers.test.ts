import {ServerlessRoutines} from '@remotion/serverless/client';
import {VERSION} from 'remotion/version';
import {expect, test} from 'vitest';
import {callLambdaSync} from '../../shared/call-lambda-sync';

test('Call function locally', async () => {
	expect(
		await callLambdaSync({
			payload: {
				logLevel: 'info',
			},
			type: ServerlessRoutines.info,
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			timeoutInTest: 120000,
		}),
	).toEqual({type: 'success', version: VERSION});
});
