import type {
	InvokeWithResponseStreamCommandOutput,
	InvokeWithResponseStreamResponseEvent,
} from '@aws-sdk/client-lambda';
import {
	LambdaClientInternals,
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
import type * as callLambdaStreaming from '../../../../lambda-client/src/call-lambda-streaming';
import {Log} from '../../cli/log';
import {innerHandler} from '../../functions/inner-routine';
import {ResponseStream} from '../../functions/streaming/response-stream';
import {streamWriter} from '../../functions/streaming/stream-writer';
import {trackMockInvocation} from './mock-invocations';

export const getMockCallFunctionStreaming: CallFunctionStreaming = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T> & {
		receivedStreamingPayload: OnMessage;
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

			const message: StreamingMessage = {
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
	await innerHandler({
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
	});

	responseStream._finish();
	responseStream.end();
};

export const getMockCallFunctionAsync: CallFunctionAsync = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T>,
) => {
	trackMockInvocation(params.payload);
	const responseStream = new ResponseStream();
	await innerHandler({
		context: {
			expectedBucketOwner: '124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			requestId: 'fake',
		},
		params: params.payload,
		responseWriter: streamWriter(responseStream),
	});

	responseStream._finish();
	responseStream.end();
};

export const getMockCallFunctionSync: CallFunctionSync = async <
	T extends ServerlessRoutines,
>(
	params: CallFunctionOptions<T>,
): Promise<ServerlessReturnValues[T]> => {
	const responseStream = new ResponseStream();
	await innerHandler({
		context: {
			expectedBucketOwner: '124',
			getRemainingTimeInMillis: () => params.timeoutInTest ?? 120000,
			requestId: 'fake',
		},
		params: params.payload,
		responseWriter: streamWriter(responseStream),
	});

	responseStream._finish();
	responseStream.end();

	const parsed = JSON.parse(
		new TextDecoder().decode(responseStream.getBufferedData()),
	) as OrError<Awaited<ServerlessReturnValues[T]>>;
	if (parsed.type === 'error') {
		throw new Error(parsed.message);
	}

	return parsed;
};

// Runs the handler in-process and exposes its writes as a Lambda response event stream.
export const getMockInvokeWithResponseStream: typeof callLambdaStreaming.invokeWithResponseStreamImplementation =
	({payload, timeoutInMilliseconds}) => {
		const params = payload as Parameters<typeof innerHandler>[0]['params'];
		trackMockInvocation(params);
		const chunks: Uint8Array[] = [];
		let finished = false;
		let error: Error | null = null;
		let wake: (() => void) | null = null;
		const notify = () => {
			wake?.();
			wake = null;
		};

		innerHandler({
			params,
			responseWriter: {
				write(message) {
					chunks.push(message);
					notify();
					return Promise.resolve();
				},
				end() {
					return Promise.resolve();
				},
			},
			context: {
				expectedBucketOwner: '124',
				getRemainingTimeInMillis: () => timeoutInMilliseconds,
				requestId: 'fake',
			},
		})
			.catch((err) => {
				error = err as Error;
			})
			.finally(() => {
				finished = true;
				notify();
			});

		const events =
			async function* (): AsyncGenerator<InvokeWithResponseStreamResponseEvent> {
				while (true) {
					const chunk = chunks.shift();
					if (chunk) {
						yield {PayloadChunk: {Payload: chunk}};
						continue;
					}

					if (finished) {
						yield {
							InvokeComplete: error
								? {ErrorCode: 'Unhandled', ErrorDetails: error.message}
								: {},
						};
						return;
					}

					await new Promise<void>((resolve) => {
						wake = resolve;
					});
				}
			};

		return Promise.resolve({
			$metadata: {},
			EventStream: events(),
		} as InvokeWithResponseStreamCommandOutput);
	};

// Reports a started render over the stream, then keeps observing it forever.
export const mockStartedRenderStream =
	(
		onStarted: () => void,
	): typeof callLambdaStreaming.invokeWithResponseStreamImplementation =>
	({functionName, region}) => {
		const events =
			async function* (): AsyncGenerator<InvokeWithResponseStreamResponseEvent> {
				yield {
					PayloadChunk: {
						Payload: LambdaClientInternals.makeStreamPayload({
							message: {
								type: 'render-started',
								payload: LambdaClientInternals.makeRenderMediaOnLambdaOutput({
									renderId: 'render-id',
									bucketName: 'bucket',
									functionName,
									region,
									rendererFunctionName: null,
								}),
							},
						}),
					},
				};
				onStarted();
				await new Promise<never>(() => undefined);
			};

		return Promise.resolve({
			$metadata: {},
			EventStream: events(),
		} as InvokeWithResponseStreamCommandOutput);
	};
