import {InvokeCommand} from '@aws-sdk/client-lambda';
import {lambdaClient} from '../src/aws-clients';
import {LambdaPayload} from '../src/constants';
import {timer} from '../src/timer';

export const fireHandler = async (params: LambdaPayload) => {
	if (params.type !== 'fire') {
		throw new Error('should be a fire param');
	}
	await Promise.all(
		params.payloads.map(async (payload, index) => {
			const callingLambdaTimer = timer('Calling lambda ' + index);
			await lambdaClient.send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(payload),
					InvocationType: 'Event',
				}),
				{}
			);
			callingLambdaTimer.end();
		})
	);
};
