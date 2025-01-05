import type {
	CallFunctionAsync,
	CallFunctionOptions,
	CallFunctionStreaming,
	CallFunctionSync,
	OnMessage,
	ServerlessReturnValues,
	ServerlessRoutines,
} from '@remotion/serverless';
import {ResponseStream} from '@remotion/serverless';
import type {AwsProvider} from '../../functions/aws-implementation';
import {mockImplementation} from '../mock-implementation';

export const getMockCallFunctionStreaming: CallFunctionStreaming<
	AwsProvider
> = async <T extends ServerlessRoutines>(
	params: CallFunctionOptions<T, AwsProvider> & {
		receivedStreamingPayload: OnMessage<AwsProvider>;
		retriesRemaining: number;
	},
) => {
	const {innerRoutine} = await import('../../functions/index');

	const responseStream = new ResponseStream();
	await innerRoutine<AwsProvider>(
		params.payload,
		responseStream,
		{
			invokedFunctionArn: 'arn:fake',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		mockImplementation,
	);

	responseStream._finish();
	responseStream.end();
};

export const getMockCallFunctionAsync: CallFunctionAsync<AwsProvider> = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T, AwsProvider>,
) => {
	const {innerRoutine} = await import('../../functions/index');

	const responseStream = new ResponseStream();
	await innerRoutine<AwsProvider>(
		params.payload,
		responseStream,
		{
			invokedFunctionArn: 'arn:fake',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		mockImplementation,
	);

	responseStream._finish();
	responseStream.end();
};

export const getMockCallFunctionSync: CallFunctionSync<AwsProvider> = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T, AwsProvider>,
): Promise<ServerlessReturnValues<AwsProvider>[T]> => {
	const {innerRoutine} = await import('../../functions/index');

	const responseStream = new ResponseStream();
	await innerRoutine<AwsProvider>(
		params.payload,
		responseStream,
		{
			invokedFunctionArn: 'arn:fake',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		mockImplementation,
	);

	responseStream._finish();
	responseStream.end();

	return JSON.parse(
		new TextDecoder().decode(responseStream.getBufferedData()),
	) as ServerlessReturnValues<AwsProvider>[T];
};
