import {
	LambdaClientInternals,
	type AwsProvider,
	type CallFunctionAsync,
	type CallFunctionOptions,
	type CallFunctionStreaming,
	type CallFunctionSync,
	type GetBinaryPayloadSink,
	type MessageTypeId,
	type OnMessage,
	type OrError,
	type ServerlessReturnValues,
	type ServerlessRoutines,
	type StreamingMessage,
} from '@remotion/lambda-client';
import {makeStreamer} from '@remotion/streaming';
import {Log} from '../../cli/log';
import {innerHandler} from '../../functions/inner-routine';
import {ResponseStream} from '../../functions/streaming/response-stream';
import {streamWriter} from '../../functions/streaming/stream-writer';
import {mockServerImplementation} from '../mock-implementation';
import {mockImplementation} from './mock-implementation';
import {trackMockInvocation} from './mock-invocations';

export const getMockCallFunctionStreaming: CallFunctionStreaming<
	AwsProvider
> = async <T extends ServerlessRoutines>(
	params: CallFunctionOptions<T, AwsProvider> & {
		receivedStreamingPayload: OnMessage<AwsProvider>;
		retriesRemaining: number;
		getBinaryPayloadSink: GetBinaryPayloadSink | null;
	},
) => {
	trackMockInvocation(params.payload);
	const responseStream = new ResponseStream();

	const {onData, clear} = makeStreamer(
		(status, messageTypeId, data) => {
			const messageType = LambdaClientInternals.messageTypeIdToMessageType(
				messageTypeId as MessageTypeId,
			);
			const innerPayload =
				LambdaClientInternals.formatMap[messageType] === 'json'
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
		},
		params.getBinaryPayloadSink
			? LambdaClientInternals.binaryPayloadSinkForStreamer(
					params.getBinaryPayloadSink,
				)
			: null,
	);

	Log.verbose(
		{indent: false, logLevel: params.payload.logLevel},
		'Called Lambda function',
		params.payload,
	);
	await innerHandler<AwsProvider>({
		params: params.payload,
		responseWriter: {
			async write(message) {
				await onData(message);
			},
			end() {
				clear();
				return Promise.resolve();
			},
		},
		context: {
			expectedBucketOwner: '124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			requestId: 'fake',
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
	trackMockInvocation(params.payload);
	const responseStream = new ResponseStream();
	await innerHandler<AwsProvider>({
		context: {
			expectedBucketOwner: '124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			requestId: 'fake',
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
			expectedBucketOwner: '124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			requestId: 'fake',
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
