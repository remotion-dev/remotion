import type {
	InvokeWithResponseStreamCommandInput,
	LambdaClient,
} from '@aws-sdk/client-lambda';

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
			FunctionName: undefined;
			Payload: InvokeWithResponseStreamCommandInput;
			InvocationType: 'Event';
		}) => {
			// @ts-expect-error
			const payload = JSON.parse(params.input.Payload);

			const {handler} = await import('../../functions/index');

			return handler(payload, {
				invokedFunctionArn: 'arn:fake',
				getRemainingTimeInMillis: () => timeoutInTest ?? 120000,
			});
		},
	} as unknown as LambdaClient;
};
