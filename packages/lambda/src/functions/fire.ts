import {InvokeCommand} from '@aws-sdk/client-lambda';
import {LambdaPayload, LambdaRoutines} from '../constants';
import {lambdaClient} from '../shared/aws-clients';
import {timer} from '../timer';

export const fireHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.fire) {
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
