import {expect, test} from 'bun:test';
import {
	ResponseStream,
	ServerlessRoutines,
	VERSION,
} from '@remotion/serverless';
import {routine} from '../../functions';

test('buffered routines serialize exceptions and end the response', async () => {
	for (const type of [
		ServerlessRoutines.info,
		ServerlessRoutines.start,
		ServerlessRoutines.compositions,
	]) {
		const responseStream = new ResponseStream();

		await routine(
			{
				type,
				version: VERSION,
				logLevel: 'error',
			} as never,
			responseStream,
			{
				awsRequestId: 'request-id',
				invokedFunctionArn: '',
				getRemainingTimeInMillis: () => 120_000,
			},
		);

		expect(responseStream.writableEnded).toBe(true);
		const response = JSON.parse(
			new TextDecoder().decode(responseStream.getBufferedData()),
		) as {
			type: string;
			message: string;
			stack: string;
		};
		expect(response).toMatchObject({
			type: 'error',
			message:
				'Lambda function unexpectedly does not have context.invokedFunctionArn',
		});
		expect(response.stack).toContain(
			'Error: Lambda function unexpectedly does not have context.invokedFunctionArn',
		);
	}
});
