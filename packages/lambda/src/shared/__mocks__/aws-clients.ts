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

			const {handler} = await import('../../functions/index');

			const responseStream = new ResponseStream();
			const res = await handler(payload, responseStream, {
				invokedFunctionArn: 'arn:fake',
				getRemainingTimeInMillis: () => timeoutInTest ?? 120000,
			});
			if (
				params.input.InvocationType === 'RequestResponse' ||
				params.input.InvocationType === 'Event'
			) {
				return {Payload: res.EventStream[0].PayloadChunk.Payload};
			}

			// When streaming, we should not consume the response
			return {
				EventStream: res.EventStream,
			};
		},
	} as unknown as LambdaClient;
};
