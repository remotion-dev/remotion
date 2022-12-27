import type {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import type {getLambdaClient as original} from '../../shared/aws-clients';

export const getLambdaClient: typeof original = () => {
	return {
		config: {
			requestHandler: {},
			apiVersion: 'fake',
		},
		destroy: () => undefined,
		middlewareStack: undefined,
		send: async (params: {
			FunctionName: undefined;
			Payload: InvokeCommand;
			InvocationType: 'Event';
		}) => {
			// @ts-expect-error
			const payload = params.input.Payload;
			const {handler} = await import('../../functions/index');

			return handler(JSON.parse(payload), {
				invokedFunctionArn: 'arn:fake',
				getRemainingTimeInMillis: () => 120000,
			});
		},
	} as unknown as LambdaClient;
};
