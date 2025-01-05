import type {
	CallFunctionAsync,
	CallFunctionOptions,
	CallFunctionStreaming,
	CallFunctionSync,
	OnMessage,
	ServerlessReturnValues,
	ServerlessRoutines,
	StreamingMessage,
} from '@remotion/serverless';
import {ResponseStream, streamWriter} from '@remotion/serverless';
import type {MessageTypeId} from '@remotion/serverless/client';
import {
	formatMap,
	messageTypeIdToMessageType,
} from '@remotion/serverless/client';
import {makeStreamer} from '@remotion/streaming';
import type {AwsProvider} from '../../functions/aws-implementation';
import {parseJsonOrThrowSource} from '../../shared/call-lambda-streaming';
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

	const {onData, clear} = makeStreamer((status, messageTypeId, data) => {
		const messageType = messageTypeIdToMessageType(
			messageTypeId as MessageTypeId,
		);
		const innerPayload =
			formatMap[messageType] === 'json'
				? parseJsonOrThrowSource(data, messageType)
				: data;

		const message: StreamingMessage<AwsProvider> = {
			successType: status,
			message: {
				type: messageType,
				payload: innerPayload,
			},
		};

		params.receivedStreamingPayload(message);
	});

	await innerRoutine<AwsProvider>(
		params.payload,
		{
			write(message) {
				onData(message);
				return Promise.resolve();
			},
			end() {
				clear();
				return Promise.resolve();
			},
		},
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
		streamWriter(responseStream),
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
		streamWriter(responseStream),
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
