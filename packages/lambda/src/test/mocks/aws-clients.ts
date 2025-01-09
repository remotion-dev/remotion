import type {
	CallFunctionAsync,
	CallFunctionOptions,
	CallFunctionStreaming,
	CallFunctionSync,
	OnMessage,
	OrError,
	ServerlessReturnValues,
	ServerlessRoutines,
	StreamingMessage,
} from '@remotion/serverless';
import {innerHandler, ResponseStream, streamWriter} from '@remotion/serverless';
import type {MessageTypeId} from '@remotion/serverless/client';
import {
	formatMap,
	messageTypeIdToMessageType,
} from '@remotion/serverless/client';
import {makeStreamer} from '@remotion/streaming';
import type {AwsProvider} from '../../functions/aws-implementation';
import {getWebhookClient} from '../../functions/http-client';
import {parseJsonOrThrowSource} from '../../shared/call-lambda-streaming';
import {
	mockImplementation,
	mockServerImplementation,
} from '../mock-implementation';

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
			invokedFunctionArn: 'arn:fake',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		providerSpecifics: mockImplementation,
		insideFunctionSpecifics: mockServerImplementation,
		webhookClient: getWebhookClient,
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
			invokedFunctionArn: 'arn:fake',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		providerSpecifics: mockImplementation,
		insideFunctionSpecifics: mockServerImplementation,
		params: params.payload,
		responseWriter: streamWriter(responseStream),
		webhookClient: getWebhookClient,
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
			invokedFunctionArn: 'arn:fake',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			awsRequestId: 'fake',
		},
		params: params.payload,
		responseWriter: streamWriter(responseStream),
		providerSpecifics: mockImplementation,
		insideFunctionSpecifics: mockServerImplementation,
		webhookClient: getWebhookClient,
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
