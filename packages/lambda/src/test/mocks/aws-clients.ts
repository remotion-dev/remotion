import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import type {
	CallFunctionAsync,
	CallFunctionOptions,
	CallFunctionStreaming,
	CallFunctionSync,
	MessageTypeId,
	OnMessage,
	OrError,
	ServerlessReturnValues,
	ServerlessRoutines,
	StreamingMessage,
} from '@remotion/serverless';
import {
	formatMap,
	innerHandler,
	messageTypeIdToMessageType,
	ResponseStream,
	streamWriter,
} from '@remotion/serverless';
import {makeStreamer} from '@remotion/streaming';
import {mockServerImplementation} from '../mock-implementation';
import {mockImplementation} from './mock-implementation';

export const getMockCallFunctionStreaming: CallFunctionStreaming<
	AwsProvider
> = async <T extends ServerlessRoutines>(
	params: CallFunctionOptions<T, AwsProvider> & {
		receivedStreamingPayload: OnMessage<AwsProvider>;
		retriesRemaining: number;
	},
) => {
	const responseStream = new ResponseStream();

	const {onData, clear} = makeStreamer((status, messageTypeId, data) => {
		const messageType = messageTypeIdToMessageType(
			messageTypeId as MessageTypeId,
		);
		const innerPayload =
			formatMap[messageType] === 'json'
				? LambdaClientInternals.parseJsonOrThrowSource(data, messageType)
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

	await innerHandler<AwsProvider>({
		params: params.payload,
		responseWriter: {
			write(message) {
				onData(message);
				return Promise.resolve();
			},
			end() {
				clear();
				return Promise.resolve();
			},
		},
		context: {
			invokedFunctionArn: 'arn:fake:1234:1234:124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		providerSpecifics: mockImplementation,
		insideFunctionSpecifics: mockServerImplementation,
	});

	responseStream._finish();
	responseStream.end();
};

export const getMockCallFunctionAsync: CallFunctionAsync<AwsProvider> = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T, AwsProvider>,
) => {
	const responseStream = new ResponseStream();
	await innerHandler<AwsProvider>({
		context: {
			invokedFunctionArn: 'arn:fake:1234:1234:124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		providerSpecifics: mockImplementation,
		insideFunctionSpecifics: mockServerImplementation,
		params: params.payload,
		responseWriter: streamWriter(responseStream),
	});

	responseStream._finish();
	responseStream.end();
};

export const getMockCallFunctionSync: CallFunctionSync<AwsProvider> = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T, AwsProvider>,
): Promise<ServerlessReturnValues<AwsProvider>[T]> => {
	const responseStream = new ResponseStream();
	await innerHandler<AwsProvider>({
		context: {
			invokedFunctionArn: 'arn:fake:1234:1234:124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		params: params.payload,
		responseWriter: streamWriter(responseStream),
		providerSpecifics: mockImplementation,
		insideFunctionSpecifics: mockServerImplementation,
	});

	responseStream._finish();
	responseStream.end();

	const parsed = JSON.parse(
		new TextDecoder().decode(responseStream.getBufferedData()),
	) as OrError<Awaited<ServerlessReturnValues<AwsProvider>[T]>>;
	if (parsed.type === 'error') {
		throw new Error(parsed.message);
	}

	return parsed;
};
