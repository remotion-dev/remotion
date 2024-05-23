/* eslint-disable @typescript-eslint/no-use-before-define */
import type {InvokeWithResponseStreamResponseEvent} from '@aws-sdk/client-lambda';
import {InvokeWithResponseStreamCommand} from '@aws-sdk/client-lambda';
import {RenderInternals} from '@remotion/renderer';
import type {
	MessageType,
	StreamingMessage,
} from '../functions/streaming/streaming';
import {formatMap, type OnMessage} from '../functions/streaming/streaming';
import type {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from './aws-clients';
import type {LambdaPayloads, LambdaRoutines} from './constants';

const INVALID_JSON_MESSAGE = 'Cannot parse Lambda response as JSON';

type Options<T extends LambdaRoutines> = {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
	region: AwsRegion;
	timeoutInTest: number;
	receivedStreamingPayload: OnMessage;
};

const parseJsonOrThrowSource = (data: Uint8Array, type: string) => {
	const asString = new TextDecoder('utf-8').decode(data);
	try {
		return JSON.parse(asString);
	} catch (err) {
		throw new Error(`Invalid JSON (${type}): ${asString}`);
	}
};

export const callLambdaWithStreaming = async <T extends LambdaRoutines>(
	options: Options<T> & {
		retriesRemaining: number;
	},
): Promise<void> => {
	// As of August 2023, Lambda streaming sometimes misses parts of the JSON response.
	// Handling this for now by applying a retry mechanism.

	try {
		// Do not remove this await
		await callLambdaWithoutRetry<T>(options);
	} catch (err) {
		if (options.retriesRemaining === 0) {
			throw err;
		}

		if (!(err as Error).message.includes(INVALID_JSON_MESSAGE)) {
			throw err;
		}

		return callLambdaWithStreaming({
			...options,
			retriesRemaining: options.retriesRemaining - 1,
		});
	}
};

const callLambdaWithoutRetry = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
	region,
	timeoutInTest,
	receivedStreamingPayload,
}: Options<T>): Promise<void> => {
	const res = await getLambdaClient(region, timeoutInTest).send(
		new InvokeWithResponseStreamCommand({
			FunctionName: functionName,
			Payload: JSON.stringify({type, ...payload}),
		}),
	);

	const {onData, clear} = RenderInternals.makeStreamer(
		(status, messageType, data) => {
			const innerPayload =
				formatMap[messageType as MessageType] === 'json'
					? parseJsonOrThrowSource(data, messageType)
					: data;

			const message: StreamingMessage = {
				successType: status,
				message: {
					type: messageType as MessageType,
					payload: innerPayload,
				},
			};

			receivedStreamingPayload(message);
		},
	);

	const events =
		res.EventStream as AsyncIterable<InvokeWithResponseStreamResponseEvent>;

	for await (const event of events) {
		// There are two types of events you can get on a stream.

		// `PayloadChunk`: These contain the actual raw bytes of the chunk
		// It has a single property: `Payload`
		if (event.PayloadChunk && event.PayloadChunk.Payload) {
			onData(event.PayloadChunk.Payload);
		}

		if (event.InvokeComplete) {
			if (event.InvokeComplete.ErrorCode) {
				const logs = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-3600~timeType~'RELATIVE~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*0a*7c*20filter*20*40requestId*20like*20*${res.$metadata.requestId}*22*0a*7c*20sort*20*40timestamp*20asc~source~(~'*2faws*2flambda*2f${functionName}))`;
				if (event.InvokeComplete.ErrorCode === 'Unhandled') {
					throw new Error(
						`Lambda function ${functionName} failed with an unhandled error: ${
							event.InvokeComplete.ErrorDetails as string
						} See ${logs} to see the logs of this invocation.`,
					);
				}

				throw new Error(
					`Lambda function ${functionName} failed with error code ${event.InvokeComplete.ErrorCode}: ${event.InvokeComplete.ErrorDetails}. See ${logs} to see the logs of this invocation.`,
				);
			}
		}
	}

	clear();
};
