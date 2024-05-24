/* eslint-disable @typescript-eslint/no-use-before-define */
import type {InvokeWithResponseStreamResponseEvent} from '@aws-sdk/client-lambda';
import {
	InvokeCommand,
	InvokeWithResponseStreamCommand,
} from '@aws-sdk/client-lambda';
import {RenderInternals} from '@remotion/renderer';
import type {
	MessageTypeId,
	OnMessage,
	StreamingMessage,
} from '../functions/streaming/streaming';
import {
	formatMap,
	messageTypeIdToMessageType,
} from '../functions/streaming/streaming';
import type {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from './aws-clients';
import type {LambdaPayloads, LambdaRoutines} from './constants';
import type {LambdaReturnValues} from './return-values';

const INVALID_JSON_MESSAGE = 'Cannot parse Lambda response as JSON';

type Options<T extends LambdaRoutines> = {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
	region: AwsRegion;
	timeoutInTest: number;
};

const parseJsonOrThrowSource = (data: Uint8Array, type: string) => {
	const asString = new TextDecoder('utf-8').decode(data);
	try {
		return JSON.parse(asString);
	} catch (err) {
		throw new Error(`Invalid JSON (${type}): ${asString}`);
	}
};

export const callLambda = async <T extends LambdaRoutines>(
	options: Options<T> & {
		retriesRemaining: number;
	},
): Promise<LambdaReturnValues[T]> => {
	try {
		// Do not remove this await
		const res = await callLambdaWithoutRetry<T>(options);
		return res;
	} catch (err) {
		if (options.retriesRemaining === 0) {
			throw err;
		}
		// TODO: Should only retry in case it is flaky

		return callLambda({
			...options,
			retriesRemaining: options.retriesRemaining - 1,
		});
	}
};

export const callLambdaWithStreaming = async <T extends LambdaRoutines>(
	options: Options<T> & {
		receivedStreamingPayload: OnMessage;
		retriesRemaining: number;
	},
): Promise<void> => {
	// As of August 2023, Lambda streaming sometimes misses parts of the JSON response.
	// Handling this for now by applying a retry mechanism.

	try {
		// Do not remove this await
		await callLambdaWithStreamingWithoutRetry<T>(options);
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
}: Options<T>): Promise<LambdaReturnValues[T]> => {
	const Payload = JSON.stringify({type, ...payload});
	const res = await getLambdaClient(region, timeoutInTest).send(
		new InvokeCommand({
			FunctionName: functionName,
			Payload,
			InvocationType: 'RequestResponse',
		}),
	);

	const decoded = new TextDecoder('utf-8').decode(res.Payload);

	try {
		return JSON.parse(decoded) as LambdaReturnValues[T];
	} catch (err) {
		throw new Error(`Invalid JSON (${type}): ${JSON.stringify(decoded)}`);
	}
};

const callLambdaWithStreamingWithoutRetry = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
	region,
	timeoutInTest,
	receivedStreamingPayload,
}: Options<T> & {
	receivedStreamingPayload: OnMessage;
}): Promise<void> => {
	const res = await getLambdaClient(region, timeoutInTest).send(
		new InvokeWithResponseStreamCommand({
			FunctionName: functionName,
			Payload: JSON.stringify({type, ...payload}),
		}),
	);

	const {onData, clear} = RenderInternals.makeStreamer(
		(status, messageTypeId, data) => {
			const messageType = messageTypeIdToMessageType(
				messageTypeId as MessageTypeId,
			);
			const innerPayload =
				formatMap[messageType] === 'json'
					? parseJsonOrThrowSource(data, messageType)
					: data;

			const message: StreamingMessage = {
				successType: status,
				message: {
					type: messageType,
					payload: innerPayload,
				},
			};

			receivedStreamingPayload(message);
		},
	);

	console.log('looking for event stream', res);
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
