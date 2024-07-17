import type {LambdaClient} from '@aws-sdk/client-lambda';

import {ResponseStream} from '../../functions/helpers/streamify-response';
import type {getLambdaClient as original} from '../../shared/aws-clients';
export const getLambdaClient: typeof original = (region, timeoutInTest) => {
	return {
		config: {
			requestHandler: {},
			apiVersion: 'fake',
		},
		destroy: () => undefined,
		middlewareStack: undefined,
		send: async (params: {
			input: {
				FunctionName: undefined;
				Payload: string;
				InvocationType: 'Event' | 'RequestResponse' | undefined;
			};
		}) => {
			const payload = JSON.parse(params.input.Payload);

			const {routine} = await import('../../functions/index');

			const responseStream = new ResponseStream();
			const prom = routine(payload, responseStream, {
				invokedFunctionArn: 'arn:fake',
				getRemainingTimeInMillis: () => timeoutInTest ?? 120000,
				awsRequestId: 'fake',
			});
			if (
				params.input.InvocationType === 'RequestResponse' ||
				params.input.InvocationType === 'Event'
			) {
				await prom;
				return {Payload: responseStream.getBufferedData()};
			}

			prom.then(() => {
				responseStream._finish();
				responseStream.end();
			});
			// When streaming, we should not consume the response
			return {
				EventStream: responseStream,
			};
		},
	} as unknown as LambdaClient;
};
